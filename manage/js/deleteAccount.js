import { deleteDocs, db, collection, query, where, getDocs } from "./firebase.js";

const btnDeleteAccount = document.getElementById("btnDeleteAccount");
const profileUsername = document.getElementById("profile-username");

btnDeleteAccount.addEventListener("click", async () => {
    const username = profileUsername.value;

    if (confirm("I want to delete my account")) {

        if (confirm(`This will permanently delete your account. including all your data Skills, Projects, Timelines and Certicates. \n\n I have read and understand these effects.`)) {

            const result = prompt(`To confirm, type "${username}" in the box below.`);

            if (result === null) return;

            if (username.trim() === "") {
                alert("Please enter your username!");
                return;
            } else {

                if (username === result) {
                    // Delete all UserData 
                    const tableNames = ["skills", "Projects", "Timeline", "Certificates", "Contact", "Profile"];

                    await Promise.all(tableNames.map(tableName => deleteUserDataByUsername(tableName, username)));
                    await deleteDocs("Settings", username);

                    // Logout
                    logout();

                } else {
                    alert("Incorrect username!");
                    return
                }
            }
        }
    }
})

async function deleteUserDataByUsername(tableName, username) {
    // Step 1: Query Firestore to find the document with matching username
    const q = query(collection(db, tableName), where("username", "==", username));
    const querySnapshot = await getDocs(q);

    if (!querySnapshot.empty) {
        // Step 1: Create an array of update promises 
        const deletePromises = querySnapshot.docs.map((docSnap) => {
            return deleteDocs(tableName, docSnap.id);
        });

        // Step 2: Wait for all updates to complete
        await Promise.all(deletePromises);
    } else {
        console.log(`No records found in ${tableName} for username: ${username}`);
    }
}