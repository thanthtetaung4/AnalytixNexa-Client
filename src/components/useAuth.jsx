import { useState, useEffect } from "react";
import { auth, db, storage } from "./firebase";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
  setPersistence,
  browserSessionPersistence,
  updateProfile,
  sendEmailVerification,
} from "firebase/auth";
import { doc, getDoc, setDoc, onSnapshot, updateDoc } from "firebase/firestore";
import {
  ref,
  uploadBytesResumable,
  deleteObject,
  getMetadata,
} from "firebase/storage";
import { FileUploadError } from "./errors";

const useAuth = () => {
  const [user, setUser] = useState(
    sessionStorage.getItem("user")
      ? JSON.parse(sessionStorage.getItem("user"))
      : localStorage.getItem("user")
      ? JSON.parse(localStorage.getItem("user"))
      : null
  );
  const [userDetails, setUserDetails] = useState(null);

  // const [user, setUser] = useState(null);
  // console.log("user", user);
  // console.log("current user", auth.currentUser);
  // console.log("Current data: ", userDetails);
  // console.log(userDetails);

  const provider = new GoogleAuthProvider();
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, [user]);

  useEffect(() => {
    if (user) {
      const unsubscribe = onSnapshot(
        doc(db, "userDetails", user.uid),
        (doc) => {
          setUserDetails(doc.data());
        }
      );

      return () => unsubscribe();
    }
  }, [user]);

  const login = async (email, password, isRemember) => {
    // Set persistence first
    !isRemember && (await setPersistence(auth, browserSessionPersistence));

    // Sign in
    await signInWithEmailAndPassword(auth, email, password).then((userCred) =>
      console.log(userCred)
    );

    // Store user information based on persistence
    if (isRemember) {
      localStorage.setItem("user", JSON.stringify(auth.currentUser));
    } else {
      sessionStorage.setItem("user", JSON.stringify(auth.currentUser));
    }

    // console.log("Login successful", auth.currentUser); // Log for verification
  };

  const loginWithGoogle = async () => {
    await signInWithPopup(auth, provider)
      .then(async (userCred) => {
        console.log("Signed in with Google", userCred);
        console.log(`${auth.currentUser.email} is Signed In`);
        localStorage.setItem("user", JSON.stringify(auth.currentUser));

        const docRef = doc(db, "userDetails", userCred.user.uid);
        const userDetails = await getDoc(docRef);
        console.log(userDetails);
        userDetails.exists()
          ? console.log("userDetails already exists!")
          : setDoc(doc(db, "userDetails", userCred.user.uid), {
              files: [],
              results: [],
              theme: "dark",
            }).then((res) => console.log("Successfully created!", res));
      })
      .catch((error) => {
        console.error(error.message);
      });
  };

  const logout = async () => {
    await auth.signOut();
    setUser(null);
    localStorage.removeItem("user");
    sessionStorage.removeItem("user");
    console.log(user, localStorage.getItem("user")),
      sessionStorage.getItem("user");
  };

  const deleteFileUserDetails = async (file) => {
    console.log("hello from deletefileuserdetails", file);
    // Find the index of the file in userDetails
    const index = userDetails.files.indexOf(file);
    console.log(index);

    if (index > -1) {
      // Create a copy of userDetails.files without the deleted file
      const updatedFiles = [...userDetails.files];
      updatedFiles.splice(index, 1);
      console.log("updated Files", updatedFiles);
      // Update userDetails state
      setUserDetails({ ...userDetails, files: updatedFiles });

      try {
        // Update userDetails document in Firestore
        await updateDoc(doc(db, "userDetails", user.uid), {
          files: updatedFiles,
        });

        // Delete the file from Firebase Storage
        const storageRef = ref(storage, `userFiles/${user.uid}/${file.name}`);

        await deleteObject(storageRef);

        console.log("File deleted successfully from userDetails and Storage");
      } catch (e) {
        console.error("Error deleting file: ", e);
      }
    }
  };

  const deleteMultipleFilesUserDetails = async (filesToDelete) => {
    try {
      const updatedFiles = userDetails.files.filter(
        (file) => !filesToDelete.includes(file)
      );

      // Update userDetails state
      setUserDetails({ ...userDetails, files: updatedFiles });

      // Batch delete files from Firestore and Storage concurrently
      await Promise.all([
        // Update userDetails document in Firestore
        updateDoc(doc(db, "userDetails", user.uid), { files: updatedFiles }),

        // Delete files from Firebase Storage concurrently
        ...filesToDelete.map((file) =>
          deleteObject(ref(storage, `userFiles/${user.uid}/${file.name}`))
        ),
      ]);

      console.log(
        "All files deleted successfully from userDetails and Storage"
      );
    } catch (e) {
      console.error("Error deleting files: ", e);
      // Handle any errors appropriately, e.g., display error messages to the user
    }
  };

  // My signup
  const signup = async (name, email, pwd) => {
    await createUserWithEmailAndPassword(auth, email, pwd)
      .then(async (userCred) => {
        console.log("Sign Up Successful");
        await updateProfile(auth.currentUser, {
          displayName: name,
        });
        await setDoc(doc(db, "userDetails", userCred.user.uid), {
          files: [],
          results: [],
          theme: "dark",
        }).then((res) => console.log("Successfully created!", res));
        sendEmailVerification(userCred.user);
      })
      .catch((e) => {
        throw e;
      });
  };

  // upload file to the storage
  const uploadFile = async (file, setUploading) => {
    if (!user) {
      console.error("User not authenticated");
      return;
    }
    // Check if the file with the same name already exists
    const existingFile = userDetails.files.find(
      (existingFile) => existingFile.name === file.name
    );
    if (existingFile) {
      throw new FileUploadError("File Already Exist", "191");
    }

    // Create a storage reference with the user's UID as the folder
    const storageRef = ref(storage, `userFiles/${user.uid}/${file.name}`);

    // Create a metadata object
    const metadata = {
      contentType: file.type,
    };

    try {
      // Upload the file
      const uploadTask = uploadBytesResumable(storageRef, file, metadata);

      // Listen for state changes, errors, and completion of the upload.
      uploadTask.on(
        "state_changed",
        (snapshot) => {
          // Handle progress, if needed
          const progress =
            (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          console.log(`Upload is ${progress}% done`);
        },
        (error) => {
          // Handle errors
          console.error("Error uploading file: ", error.message);
        },
        async () => {
          // Upload completed successfully, get download URL

          const fileSize = (await getMetadata(uploadTask.snapshot.ref)).size;
          const path = (await getMetadata(uploadTask.snapshot.ref)).fullPath;
          // Update userDetails in Firestore with the new file
          const updatedFiles = [
            ...userDetails.files,
            {
              name: file.name,
              available: true,
              size: fileSize,
              path: path,
            },
          ];
          setUserDetails({ ...userDetails, files: updatedFiles });

          // Update userDetails document in Firestore
          try {
            await updateDoc(doc(db, "userDetails", user.uid), {
              files: updatedFiles,
            });
          } catch (e) {
            console.log("Error updating userDetails in Firestore: ", e);
          }

          console.log("File uploaded successfully! Path:", path);
          setUploading(false);
        }
      );
    } catch (e) {
      console.error("Error preparing upload task: ", e);
    }
  };

  const updateResult = async (result, fileName, setAnalysing) => {
    try {
      // Check for user authentication
      if (!user) {
        throw new Error("User not authenticated");
      }

      // Update the userDetails document in Firestore
      const myResult = {
        ...result,
        fileName: fileName,
        createdAt: Date.now(),
      };
      // Add the new result to the existing results array
      const updatedResults = [...userDetails.results, myResult];
      const updatedFiles = userDetails.files.map((file) =>
        file.name === fileName ? { ...file, available: false } : file
      );
      await updateDoc(doc(db, "userDetails", user.uid), {
        results: updatedResults,
        files: updatedFiles,
      });
      setAnalysing(false);
      console.log("User details updated with new result");
    } catch (error) {
      console.error("Error updating user details:", error);
    }
  };

  const changeTheme = async (newTheme) => {
    await updateDoc(doc(db, "userDetails", user.uid), {
      theme: newTheme,
    });
  };

  return {
    user,
    userDetails,
    login,
    loginWithGoogle,
    logout,
    signup,
    deleteFileUserDetails,
    uploadFile,
    deleteMultipleFilesUserDetails,
    updateResult,
    changeTheme,
  };
};

export default useAuth;
