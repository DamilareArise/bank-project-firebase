import { initializeApp } from "https://www.gstatic.com/firebasejs/12.14.0/firebase-app.js";
import { 
        getAuth, 
        createUserWithEmailAndPassword, 
        signInWithEmailAndPassword, 
        GoogleAuthProvider, 
        signInWithPopup,
        onAuthStateChanged, 
        signOut
    } from "https://www.gstatic.com/firebasejs/12.14.0/firebase-auth.js";

import { getDatabase, ref, set, onValue } from "https://www.gstatic.com/firebasejs/12.14.0/firebase-database.js"


const firebaseConfig = {
    apiKey: "AIzaSyDDyoS0H4iwD86JfLJpgzAPy4z8MNrnE4Y",
    authDomain: "bank-project-d5d0a.firebaseapp.com",
    databaseURL: "https://bank-project-d5d0a-default-rtdb.firebaseio.com",
    projectId: "bank-project-d5d0a",
    storageBucket: "bank-project-d5d0a.firebasestorage.app",
    messagingSenderId: "368053686679",
    appId: "1:368053686679:web:b4269e8e4814c5358734d2"
};


export default class FirebaseBank{
    current_user = null

    constructor(){
        this.app = initializeApp(firebaseConfig);
        this.auth = getAuth(this.app);
        this.provider = new GoogleAuthProvider()
        this.database = getDatabase(this.app);

    }

    registerWithEmailAndPassword(fullname, email, password){
        // Creating account using email and password from firebase auth

        if(fullname=="" || email=="" || password==""){
            return {
                status: false,
                message: "All Input Fields Required"
            }
        }

        return createUserWithEmailAndPassword(this.auth, email, password)
            .then((userCredential) => {
                const user = userCredential.user;
                console.log(user);

                // save user in db
                this.saveUserToDB(user, fullname)
            
                return {
                    status: true,
                    message: "Account created successfully",
                    data: user
                }
                
            })
            .catch((error) => {
                const errorCode = error.code;
                const errorMessage = error.message;
                console.log(errorMessage);

                return {
                    status: false,
                    message: errorMessage
                }
                
            });
           
    }

    registerWithGoogle(){
        return signInWithPopup(this.auth, this.provider)
        .then((result) => {
            const user = result.user;
            return {
                status: true,
                message: "Account created successfully",
                data: user
            }
        })
        .catch((error) => {
            const errorMessage = error.message;
            console.log(errorMessage);

            return {
                status: false,
                message: errorMessage
            }
        })
    }

    loginWithEmailAndPassword(email, password){
        if(email=="" || password == ""){
            return {
                status: false,
                message: "All Input Fields Required"
            }
        }

        return signInWithEmailAndPassword(this.auth, email, password)
            .then((userCredential) => {
                // Signed in 
                const user = userCredential.user;
                return {
                    status: true,
                    message: "Login successful",
                    data: user
                }
            })
            .catch((error) => {
                const errorCode = error.code;
                const errorMessage = error.message;
                return {
                    status: false,
                    message: errorMessage
                }
            });
    }

    checkUserAuth(){
        let result = new Promise((resolve)=>{
            onAuthStateChanged(this.auth, (user)=>{
                if(user){
                    
                    this.getUserById(user.uid)
                    .then((res)=>{
                        resolve({status: true, data: res}) 
                    })
                }
                else{
                    resolve({status: false})
                }
            })
        })

        return result
    }

    logout(){
         signOut(this.auth)
         .then(() => {
                window.location.href = "./index.html"  
            }).catch((error) => {
                console.log('An error occured');
            });
    }

    saveUserToDB(user, fullname){
      
        
        let userId = user.uid
        let imageUrl = user.photoUrl ?? null
        let email = user.email
        let balance = 0.0
        let rand = Math.round(Math.random() * 100000000)
        let account_no = "20"+rand
        let pin = null

        const userRef = ref(this.database, 'users/' + userId)
        set(userRef, {
            userId,
            fullname,
            email,
            imageUrl: imageUrl,
            balance,
            account_no,
            pin: pin
        })
    }

    getUserById(uid){
        const userRef = ref(this.database, "users/" + uid)
        let res = new Promise((resolve)=>{
            onValue(userRef, (snapshot) => {
                const data = snapshot.val();

                // set current user 
                this.current_user = data

                resolve(data)
            });            
        })

        return res
    }


    performDeposit(amount){
        if (amount < 1){
            return {
                status: false,
                message: "Invalid amount"
            }
        }
        // console.log(this.uid);
        
        let current_balance = parseFloat(this.current_user.balance)

        current_balance += parseFloat(amount)
        this.current_user.balance = current_balance
        console.log(this.current_user);
        
        let userRef = ref(this.database, "users/" + this.current_user.userId)
        set(userRef, this.current_user)

        return {
            status: true,
            message: "Deposit successful",
            data: this.current_user
        }
    }


    performTransfer(recipient_acct, amount){
        if(recipient_acct=="" || amount == null){
            return {
                status: false,
                message: "Recipient account and amount required"
            }
        }

        if(amount > this.current_user.balance){
            return {
                status: false,
                message: "Insufficient funds"
            }
        }

        const userRef = ref(this.database, "users/")
        let recipient = new Promise((resolve)=>{
            onValue(userRef, (snapshot)=>{
                const data = snapshot.val()
                let allusers = Object.values(data)
                // console.log(allusers[0]);
                let res = allusers.find(user => user.account_no == recipient_acct)
                resolve(res)
            })
        })

        console.log(recipient);
        
    }
}


// let users =  {
//     gthg2uoUZbvHZ6XCueRvktPhzy2 : {account_no: '2064274564', balance: 6000, email: 'tobioyee@gmail.com', fullname: 'Good', userId: '0gthg2uoUZbvHZ6XCueRvktPhzy2'},

// }
