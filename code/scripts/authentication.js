////  Functional Code  ////

// Main
$(document).ready(function () {
  firebase.auth().onAuthStateChanged(function(user) {
    if (user) {
      window.location.href = './index.html';
    }
  });
  
  let nameInput = $("#nameIn");
  let emailInput = $("#emailIn");
  let passwordInput = $("#passwordIn");
  let registerBtn = $("#registerButton");
  let signInBtn = $(".signin");

  //registration
  $(registerBtn).click(function () {
    let email = emailInput.val();
    let password = passwordInput.val();
    let name = nameInput.val();
    if(!email.includes("@umich.edu"))
    {
      alert("Email must be a umich email");
    }
    else if(!name.length > 0)
    {
      alert("Please enter your name");
    }
    else if(!(password.length >= 6))
    {
      alert("Password must be at least 6 characters");
    }
    else
    {
      firebase.auth().createUserWithEmailAndPassword(email, password)
      .then((user) => {
        let name = nameInput.val();
        let uid = firebase.auth().currentUser.uid;
        console.log(uid);
          firebase.database().ref('users/' + uid).set({
            username: name,
          }, (error) => {
            if (error) {
              // The write failed...
              console.log(error);
            } else {
              // Data saved successfully!
              window.location.href = './index.html';
            }
          });
        
      })
      .catch((error) => {
        alert("This email already has an account");
        let errorCode = error.code;
        let errorMessage = error.message;
        console.log(errorCode);
        console.log(errorMessage);
      });
    }    
  });

  //already have an account - sign in
  $(signInBtn).click(function () {
    window.location.href = './login.html';
  });

  let emailIn = $("#emailExists");
  let passwordIn = $("#passwordExists");
  let signInBtn2 = $("#signInButton");
  let passwordBtn = $(".forgotPassword");

  $(signInBtn2).click(function () {
    let email = emailIn.val();
    let password = passwordIn.val();
    firebase.auth().signInWithEmailAndPassword(email, password)
    .then((user) => {
      window.location.href = './index.html';
    })
    .catch((error) => {
      alert("Username or Password is Incorrect");
      let errorCode = error.code;
      let errorMessage = error.message;
      console.log(errorCode);
      console.log(errorMessage);
    });
  });

  $(passwordBtn).click(function () {
    let email = emailIn.val();
    if(!email.includes("@umich.edu"))
    {
      alert("Please enter a valid email");
    }
    else{
      let auth = firebase.auth();
      auth.sendPasswordResetEmail(email).then(function() {
        alert("Please check your email for a password reset link");
      }).catch(function(error) {
        alert("Email not found");
      });
    }
  });

  

});

