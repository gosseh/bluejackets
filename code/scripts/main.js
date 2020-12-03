var expanded;
var post;
var firstheader;
var backBtn;
var infoBtn;
var newPostBtn;
var upload;
var uploadBtn;
let count = -1;
var allPosts;
var contentHeader;
var cancelBtn;
var addBtn;
var mapBtn;

////  Functional Code  ////

// Main
$(document).ready(function () { 
  post = $('.post')
  firstheader = $('.website-title');
  create = $("#createPost");
  uploadBtn = $("#submitBtn");
  allPosts = $(".allPosts");
  contentContainer = $(".content-container");
  contentHeader = $("#content-heading");
  cancelBtn = (".cancelBtn");
  expanded = $(".expanded-images");
  newPostBtn = $(".addBtn")
  create.hide();

  //load all of the posts
  firebase.database().ref("users/").once("value").then(function(snapshot) {
    snapshot.forEach(function(childSnapshot) {
    var url = childSnapshot.child("url").val();
    if(url){
      count++;
      var time = childSnapshot.child("time").val();
      var email = childSnapshot.child("email").val();
      var uniqname = email.substring(0, email.length - 10);
      var capacity = childSnapshot.child("capacity").val();
      var sport = childSnapshot.child("sport").val();
      var name = childSnapshot.child("username").val();
      var locationName = childSnapshot.child("location").val();
      var people = parseInt(childSnapshot.child("people").val());
      var userID = childSnapshot.child("id").val();
      let uid = firebase.auth().currentUser.uid;
      firebase.database().ref('users/' + userID).update({postNum: count,});
      var num = childSnapshot.child("postNum").val();
      var post = createPostDiv(url, num, time, uniqname, capacity, sport, people);
      allPosts.append(post);
      infoBtn = $('#user-info' + num);
      addBtn = $('#user-add' + num);
      var expandedPost = createExpandedDiv(num, locationName, sport, name, url);
      expanded.append(expandedPost);
      $('.expanded' + num).hide();
      backBtn = $("#backBtn" + num);
      mapBtn = $("#mapBtn" + num)
      $(infoBtn).click(function () {
        contentHeader.hide();
        allPosts.hide();
        firstheader.hide();
        var count2 = 0;
        while(count2 <= count){
          if(count2 !== num){
            $('.expanded' + count2).hide();
          }
          else{
            $('.expanded' + count2).show();
          }
          count2++;
        }
      });

      $(backBtn).click(function () {
        contentHeader.show();
        allPosts.show();
        firstheader.show();
        $('.expanded' + num).hide();
      });

      $(addBtn).click(function () { 
        var ref = firebase.database().ref("users/" + userID);
        ref.child("people").once('value',function(snapshot){
          console.log(parseInt(snapshot.val()) + 1)
          var numPeople = parseInt(snapshot.val()) + 1;
          firebase.database().ref('users/' + userID).update({people: numPeople,});
          location.reload();
          
        });
      });

      $(mapBtn).click(function () { 
        var originLat = 1000000;
        var originLon = 1000000;
        var destLat = 1000000;
        var destLon = 1000000;
        firebase.database().ref("users/").once("value").then(function(snapshot) {
          snapshot.forEach(function(childSnapshot) { 
            let checkID = childSnapshot.child("id").val();
            if(checkID === userID){
              destLat = parseFloat(childSnapshot.child("lat").val());
              destLon = parseFloat(childSnapshot.child("lng").val());
            }
            if(checkID === uid){
              originLat = parseFloat(childSnapshot.child("lat").val());
              originLon = parseFloat(childSnapshot.child("lng").val());
            }
            if(originLat !== 1000000 && originLon !== 1000000 && destLat !== 1000000 && destLon !== 1000000){
              let url = "https://www.google.com/maps/dir/?api=1";
              let origin = "&origin=" + originLat + "," + originLon;
              let destination = "&destination=" + destLat + "," + destLon;
              let travelmode = "&travelmode=transit";
              let newUrl = new URL(url + origin + destination + travelmode);
              window.open(newUrl, '_blank');
            }
          }); 
        });
      });
    }
    });
  });


  $(newPostBtn).click(function () {
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
    let located = locationIn.val();
  
    if(sport === "" || capacityString === "" || located === "" || !imageIn)
    {
      alert("Please fill out all the fields of this form");
    }
    else
    {
      var time = new Date();
      time = time.toString();
      time = time.substring(4, 24);
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
        console.log(time);
        firebase.database().ref('users/' + uid).update({
          url: url,
          id: uid,
          time: time,
          sport: sport,
          capacity: capacity,
          location: located,
          people: 0,
        }, (error) => {
            if (error) {
              // The write failed...
              console.log(error);
            } 
          });
          location.reload();
        });
      });

      create.hide();
      allPosts.show();
      contentHeader.show();
    }
    
    
  });




});

function createPostDiv(url, index, time, name, capacity, sport, people) {
  return "<div class='post post" + index + "'> <div class='user-header'><span class='user-header-text'>" + name + " - "+ sport + "</span><span class ='user-header-capacity'> CAP: "+people+"/"+capacity+"</span></div><img src='" + url + " alt='user-image' class='user-image'><div class='user-button-panel'><button class='btn btn-secondary user-info-btn' id='user-info"+index+"'> More Info </button><button class='btn btn-secondary user-add-btn' id='user-add"+index+"'> Add </button><div class='user-time'>" + time + "</div></div></div>"
}

function createExpandedDiv(index, location, sport, name, url) {
  return "<div class='expanded" + index + "'><figure class='expanded-image'><h1 class='more-info'>More Information</h1><button class='backBtn' id='backBtn"+index+"'>Back</button><br><img class='posted' src='"+ url + "'><figcaption>"+location+" <button id='mapBtn"+ index +"'>Directions</button></figcaption><figcaption>"+sport+"</figcaption><figcaption>Posted by: "+ name +"</figcaption></figure></div></div>"
}


          