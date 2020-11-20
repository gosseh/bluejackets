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

////  Functional Code  ////

// Main
$(document).ready(function () {

  infoBtn = $('.user-info-btn');
  expanded = $('.expanded-image');
  post = $('.post')
  firstheader = $('.website-title');
  backBtn = $(".backBtn");
  addBtn = $(".addBtn");
  upload = $(".upload");
  uploadBtn = $("#submitBtn");
  allPosts = $(".allPosts");

  expanded.hide();
  upload.hide();

  $(infoBtn).click(function () {
    allPosts.hide();
    firstheader.hide();
    expanded.show();
  });

  $(backBtn).click(function () {
    allPosts.show();
    firstheader.show();
    expanded.hide();
  });

  $(addBtn).click(function () {
    upload.show();
  });

  $(uploadBtn).click(function () {
    //stuff for uploading images

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
          break;

        case 'storage/canceled':
          // User canceled the upload
          break;

        case 'storage/unknown':
          // Unknown error occurred, inspect error.serverResponse
          break;
      }
    }, function() {
    // Upload completed successfully, now we can get the download URL
      uploadTask.snapshot.ref.getDownloadURL().then(function(downloadURL) {
      console.log('File available at', downloadURL);
      url = downloadURL;
      //create div for new post
      var code = createPostDiv(url, count, time);
      allPosts.append(code);
      count++;
      });
    });
  });




});

function createPostDiv(url, index, time) {
  return "<div class='post" + index + "'> <div class='user-header'><span class='user-header-text'>Tommy123 - Frisbee</span><span class ='user-header-capacity'> CAP: 0/0</span></div><img src='" + url + " alt='user-image' class='user-image'><div class='user-button-panel'><button class='btn btn-secondary user-info-btn'> More Info </button><button class='btn btn-secondary user-add-btn'> Add </button><div class='user-time'>" + time + "</div></div></div>"
}
