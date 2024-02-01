import { db } from "./firebase";
import { collection, addDoc, getDocs } from "firebase/firestore";

const useFirestore = () => {
  const fetchData = async () => {
    const querySnapshot = await getDocs(collection(db, "users"));
    querySnapshot.forEach((doc) => {
      console.log(`${doc.id} => ${doc.data()}`);
    });
  };

  const addUser = async (user) => {
    try {
      const docRef = await addDoc(collection(db, "users"), {
        first: user.fname,
        last: user.lname,
      });

      console.log("Document written with ID: ", docRef.id);
    } catch (e) {
      console.error("Error adding document: ", e);
    }
  };

  return fetchData, addUser;
};

export default useFirestore;
