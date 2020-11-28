var expanded;
var post;
var firstheader;
var backBtn;
var infoBtn;
var addBtn;
var upload;
var uploadBtn;
let count = 0;
var allPosts;
var contentHeader;
var cancelBtn;

////  Functional Code  ////

// Main
$(document).ready(function () {

  infoBtn = $('.user-info-btn');
  expanded = $('.expanded-images');
  post = $('.post')
  firstheader = $('.website-title');
  backBtn = $(".backBtn");
  addBtn = $(".addBtn");
  create = $("#createPost");
  uploadBtn = $("#submitBtn");
  allPosts = $(".allPosts");
  contentHeader = $("#contentHeading");
  cancelBtn = (".cancelBtn");

  expanded.hide();
  create.hide();

  $(infoBtn).click(function () {
    contentHeader.hide();
    allPosts.hide();
    firstheader.hide();
    expanded.show();
  });

  $(backBtn).click(function () {
    contentHeader.show();
    allPosts.show();
    firstheader.show();
    expanded.hide();
  });

  $(addBtn).click(function () {
    create.show();
    allPosts.hide();
    contentHeader.hide();
  });

  $(cancelBtn).click(function () {
    create.hide();
    allPosts.show();
    contentHeader.show();
  });

  $(uploadBtn).click(function () {
    //stuff for uploading images
    let sportIn = $("#sportInput");
    let capacityIn = $("#capacityInput");
    let locationIn = $("#locationInput");
    let imageIn = $("#uploadImg").prop("files")[0];
    let sport = sportIn.val();
    let capacityString = capacityIn.val();
    let capacity = parseInt(capacityIn.val());
    let location = locationIn.val();
  
    if(sport === "" || capacityString === "" || location === "" || !imageIn)
    {
      alert("Please fill out all the fields of this form");
    }
    else
    {
      var time = new Date();
      console.log(time);
      var storageRef = firebase.storage().ref(time.toString());
      var url;

      var file = $("#uploadImg").prop("files")[0];

      storageRef.put(file);

      // Create the file metadata
      var metadata = {
        contentType: 'image/jpeg'
      };

      // Upload file and metadata to the object 'images/mountains.jpg'
      var uploadTask = storageRef.child('images/' + file.name).put(file, metadata);

      // Listen for state changes, errors, and completion of the upload.
      uploadTask.on(firebase.storage.TaskEvent.STATE_CHANGED, // or 'state_changed'
        function(snapshot) {
          // Get task progress, including the number of bytes uploaded and the total number of bytes to be uploaded
          var progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          console.log('Upload is ' + progress + '% done');
          switch (snapshot.state) {
            case firebase.storage.TaskState.PAUSED: // or 'paused'
              console.log('Upload is paused');
              break;
            case firebase.storage.TaskState.RUNNING: // or 'running'
              console.log('Upload is running');
              break;
          }
        }, function(error) {

        // A full list of error codes is available at
        // https://firebase.google.com/docs/storage/web/handle-errors
        switch (error.code) {
          case 'storage/unauthorized':
            // User doesn't have permission to access the object
            console.log("Unauthorized storage");
            break;

          case 'storage/canceled':
            // User canceled the upload
            console.log("Storage cancelled");
            break;

          case 'storage/unknown':
            // Unknown error occurred, inspect error.serverResponse
            console.log("Unknown Storage");
            break;
        }
      }, function() {
      // Upload completed successfully, now we can get the download URL
        uploadTask.snapshot.ref.getDownloadURL().then(function(downloadURL) {
        console.log('File available at', downloadURL);
        url = downloadURL;
        //create div for new post
        let uid = firebase.auth().currentUser.uid;
        console.log(uid);
          firebase.database().ref('users/' + uid).update({
            url: url,
            time: time,
            sport: sport,
            capacity: capacity,
            location: location
          }, (error) => {
            if (error) {
              // The write failed...
              console.log(error);
            } 
          });
        var code = createPostDiv(url, count, time);
        allPosts.append(code);
        count++;
        });
      });

      create.hide();
      allPosts.show();
      contentHeader.show();
    }
    
    
  });




});

function createPostDiv(url, index, time) {
  return "<div class='post" + index + "'> <div class='user-header'><span class='user-header-text'>Tommy123 - Frisbee</span><span class ='user-header-capacity'> CAP: 0/0</span></div><img src='" + url + " alt='user-image' class='user-image'><div class='user-button-panel'><button class='btn btn-secondary user-info-btn'> More Info </button><button class='btn btn-secondary user-add-btn'> Add </button><div class='user-time'>" + time + "</div></div></div>"
}
