// MVC  - model, views and controllers


// Your web app's Firebase configuration
export const firebaseConfig = {
    apiKey: "AIzaSyDDyoS0H4iwD86JfLJpgzAPy4z8MNrnE4Y",
    authDomain: "bank-project-d5d0a.firebaseapp.com",
    databaseURL: "https://bank-project-d5d0a-default-rtdb.firebaseio.com",
    projectId: "bank-project-d5d0a",
    storageBucket: "bank-project-d5d0a.firebasestorage.app",
    messagingSenderId: "368053686679",
    appId: "1:368053686679:web:b4269e8e4814c5358734d2"
};




export class Bank{
    #database = []
    #transactions = []

    constructor(){
        this.#database = JSON.parse(localStorage.getItem('users')) || []
        this.#transactions = JSON.parse(localStorage.getItem('transactions')) || []
    }


    create_account(fullname, email, password){
        if(fullname=="" || email=="" || password==""){
            return "Input fields are required"
        }

        let check_email = this.#database.find( user => user.email === email )
        // console.log(check_email);
        
        if(check_email){
            return 'Email already exist'
        }

        let rand = Math.round(Math.random() * 100000000)
        let account_no = "20"+rand

        let user = {
            fullname,
            email,
            password,
            account_no,
            balance: 0,
            pin: null
        }

        this.#database.push(user)
        // [{}]
        // localStorage.setItem('users', JSON.stringify(this.#database))
        localStorage.users = JSON.stringify(this.#database)
        return "Registration successfull"
    }

    login(email, password){
        if(email==null || password==null){
            return "Input fields are required"
        }

        let user = this.#database.find( user => user.email === email && user.password === password )
        if(user){
            localStorage.loggedEmail = user.email
            return {
                status: true,
                message: "Login successful"
            }
        }else{
            return {
                status: false,
                message: "Incorrect email or password"
            }
        }
        
    }

    getUser(email){
        let user = this.#database.find( user => user.email === email )
        return user
    }

    getBalance(email){
        let user = this.getUser(email)
        if(user){
            return `$${user.balance}`
        }
        else{
            return null
        }
    }

    withdraw(email, amount){
        let user = this.getUser(email)
        if(!user){
            return "User not found"
        }

        if(amount < 1){
            return 'Invalid amount'
        }
        else if(amount > user.balance){
            return 'Insufficient fund'
        }
        else{
            user.balance -= amount
            // update localstorage
            localStorage.users = JSON.stringify(this.#database)
            this.logTransactions(amount, user.account_no, user.account_no, "debit")
            return 'Transaction successfull'
        }
    }

    deposit(email, amount){
        if(amount < 1){
            return 'Invalid amount'
        }

        let user = this.getUser(email)
        
        if(user){
            user.balance += amount
            console.log(user);

            // update localstorage
            localStorage.users = JSON.stringify(this.#database)
            this.logTransactions(amount, user.account_no, user.account_no, "credit")
            return 'Transaction successful'
        }

        // this.#balance += amount
        return "user not found"
    }

    update_pin(email, pin){
        if(pin=="" || pin==null){
            return "Please enter pin"
        }
        let user = this.getUser(email)
        user['pin'] = pin
        localStorage.users = JSON.stringify(this.#database)
        return "Pin updated successfully"
        
    }

    logTransactions(amount, sender, reciever,  type){
        let txId = "txId-"+ Math.round(Math.random() *100000)
        let transact = {
            txId,
            sender_no: sender,
            reciever_no: reciever,
            amount,
            type,
            datetime: new Date()
        }
        this.#transactions.push(transact)
        localStorage.transactions = JSON.stringify(this.#transactions)
    }

    trxHistory(account_no){
        let history = this.#transactions.filter(trx => trx.sender_no === account_no || trx.reciever_no === account_no)

        return history
    }
}



