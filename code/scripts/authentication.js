////  Global Variables   ////
var nameInput;
var usernameInput;
var emailInput;
var passwordInput;
var registerBtn;
var signInBtn;



////  Functional Code  ////

// Main
$(document).ready(function () {
  nameInput = $("#nameIn");
  usernameInput = $("#usernameIn");
  emailInput = $("#emailIn");
  passwordInput = $("#passwordIn");
  registerBtn = $("#registerButton");
  signInBtn = $(".signin");

  $(registerBtn).click(function () {
    var email = emailInput.val();
    var password = passwordInput.val();
    if(!email.includes("@umich.edu"))
    {
      alert("Email must be a umich email");
    }
    else
    {
      firebase.auth().createUserWithEmailAndPassword(email, password)
      .then((user) => {
        var name = nameInput.val();
        var uid = firebase.auth().currentUser.uid;
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
        var errorCode = error.code;
        var errorMessage = error.message;
        console.log(errorCode);
        console.log(errorMessage);
      });
    }
    
  });


  

});

