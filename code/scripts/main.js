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
var cancelBtn;
var addBtn;
var mapBtn;
var logout;
var containerPort;
var deleteBtn;

////  Functional Code  ////

// Main
$(document).ready(function () {
  if(document.URL.indexOf("#")==-1){
    url = document.URL+"#loaded";
    location = "#loaded";
    location.reload();
  }

  firstheader = $('.website-title');
  create = $("#createPost");
  uploadBtn = $("#submitBtn");
  allPosts = $(".allPosts");
  cancelBtn = ("#cancelBtn");
  expanded = $(".expanded-images");
  containerPort = $(".container-port");
  newPostBtn = $(".addBtn");
  logout = $(".logoutBtn");
  create.hide();

  var params = {};
  window.location.search
    .replace(/[?&]+([^=&]+)=([^&]*)/gi, function (str, key, value) {
      params[key] = value;
    }
    );


  //load all of the posts
  firebase.database().ref("users/").once("value").then(function (snapshot) {
    snapshot.forEach(function (childSnapshot) {
      var url = childSnapshot.child("url").val();
      if (url) {
        count++;
        var sport = childSnapshot.child("sport").val();

        if ('filter' in params && sport != params['filter']) {
          return;
        }

        var time = childSnapshot.child("time").val();
        var email = childSnapshot.child("email").val();
        var uniqname = email.substring(0, email.length - 10);
        var capacity = childSnapshot.child("capacity").val();
        var name = childSnapshot.child("username").val();
        var locationName = childSnapshot.child("location").val();
        var people = parseInt(childSnapshot.child("people").val());
        var userID = childSnapshot.child("id").val();
        let uid = firebase.auth().currentUser.uid;
        firebase.database().ref('users/' + userID).update({ postNum: count, });
        var num = childSnapshot.child("postNum").val();
        var post;

        var distance = "Location not available"

        var lat1;
        var lon1;
        var lat2;
        var lon2;

        firebase.database().ref("users/" + userID).child("lat").once('value', function (snapshot) {
          lat1 = snapshot.val();
          firebase.database().ref("users/" + uid).child("lat").once('value', function (snapshot) {
            lat2 = snapshot.val();
            firebase.database().ref("users/" + userID).child("lng").once('value', function (snapshot) {
              lon1 = snapshot.val();
              firebase.database().ref("users/" + uid).child("lng").once('value', function (snapshot) {
                lon2 = snapshot.val();
                distance = get_distance(lat1, lon1, lat2, lon2).toFixed(2) + " miles away";
                post = createPostDiv(url, num, time, uniqname, capacity, sport, people, distance);
                containerPort.append(post);
                deleteBtn = $('#user-delete' + num);
                if(uid === userID){
                  deleteBtn.show();
                }
                else{
                  deleteBtn.hide();
                }
                infoBtn = $('#user-info' + num);
                addBtn = $('#user-add' + num);
                var expandedPost = createExpandedDiv(num, locationName, sport, name, url);
                expanded.append(expandedPost);
                $('.expanded' + num).hide();
                backBtn = $("#backBtn" + num);
                mapBtn = $("#mapBtn" + num)
                $(infoBtn).click(function () {
                  containerPort.removeClass("d-flex");
                  containerPort.addClass("d-none");
                  allPosts.hide();
                  firstheader.hide();
                  var count2 = 0;
                  while (count2 <= count) {
                    if (count2 !== num) {
                      $('.expanded' + count2).hide();
                    }
                    else {
                      $('.expanded' + count2).show();
                    }
                    count2++;
                  }
                });

                $(deleteBtn).click(function () {
                  firebase.database().ref('users/' + userID).update({ url: "", });
                  location.reload();
                });

                $(backBtn).click(function () {
                  containerPort.addClass("d-flex");
                  containerPort.removeClass("d-none");
                  allPosts.show();
                  firstheader.show();
                  $('.expanded' + num).hide();
                });



                $(addBtn).click(function () {
                  var ref = firebase.database().ref("users/" + userID);
                  ref.child("people").once('value', function (snapshot) {
                    var numPeople = parseInt(snapshot.val()) + 1;
                    if (numPeople > capacity) {
                      alert("This location has reached maximum capacity.");
                    }
                    else {
                      firebase.database().ref('users/' + userID).update({ people: numPeople, });
                      location.reload();
                    }

                  });
                });

                $(mapBtn).click(function () {
                  var originLat = 1000000;
                  var originLon = 1000000;
                  var destLat = 1000000;
                  var destLon = 1000000;
                  firebase.database().ref("users/").once("value").then(function (snapshot) {
                    snapshot.forEach(function (childSnapshot) {
                      let checkID = childSnapshot.child("id").val();
                      if (checkID === userID) {
                        destLat = parseFloat(childSnapshot.child("lat").val());
                        destLon = parseFloat(childSnapshot.child("lng").val());
                      }
                      if (checkID === uid) {
                        originLat = parseFloat(childSnapshot.child("lat").val());
                        originLon = parseFloat(childSnapshot.child("lng").val());
                      }
                      if (originLat !== 1000000 && originLon !== 1000000 && destLat !== 1000000 && destLon !== 1000000) {
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

              });


            });


          });


        });




      }
    });
  });


  $(newPostBtn).click(function () {
    create.show();
    containerPort.removeClass("d-flex");
    containerPort.addClass("d-none");
    expanded.hide();
    allPosts.hide();
  });

  $(logout).click(function () {
    firebase.auth().signOut().then(function () {
      window.location.href = './login.html';
    }).catch(function (error) {
      console.log(error);
    });
  });

  $(cancelBtn).click(function () {
    create.hide();
    containerPort.addClass("d-flex");
    containerPort.removeClass("d-none");
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

    if (sport === "" || capacityString === "" || located === "" || !imageIn) {
      alert("Please fill out all the fields of this form");
    }
    else {
      var time = new Date();
      time = time.toString();
      time = time.substring(4, 24);
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
        function (snapshot) {
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
        }, function (error) {

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
        }, function () {
          // Upload completed successfully, now we can get the download URL
          uploadTask.snapshot.ref.getDownloadURL().then(function (downloadURL) {
            console.log('File available at', downloadURL);
            url = downloadURL;
            //create div for new post
            let uid = firebase.auth().currentUser.uid;
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
            if(document.URL.indexOf("#")!=-1){
              // Set the URL to whatever it was plus "#loaded".
              url = document.URL.substring(0, document.URL.length - 7);
              location = "";
              //Reload the page using reload() method
              location.reload();
            }
          });
        });

      create.hide();
    }


  });




});

function get_distance(lat1, lon1, lat2, lon2) {
  if ((lat1 == lat2) && (lon1 == lon2)) {
    return 0;
  }
  else {
    var radlat1 = Math.PI * lat1 / 180;
    var radlat2 = Math.PI * lat2 / 180;
    var theta = lon1 - lon2;
    var radtheta = Math.PI * theta / 180;
    var dist = Math.sin(radlat1) * Math.sin(radlat2) + Math.cos(radlat1) * Math.cos(radlat2) * Math.cos(radtheta);
    if (dist > 1) {
      dist = 1;
    }
    dist = Math.acos(dist);
    dist = dist * 180 / Math.PI;
    dist = dist * 60 * 1.1515;
    return dist;
  }
}

function createPostDiv(url, index, time, name, capacity, sport, people, distance) {
  return "<div class='card border-dark mx-auto mr-5 mb-2 mt-5' style='width: 23em;'id=post" + index + "'><img class='card-img-top' src='" + url + " alt='user-image'><div class='card-body text-center'><h4 class='card-title'>" + name + " - " + sport + "</h4><p class='card-text'>Capacity: " + people + "/" + capacity + "</p><p class='user-time'>Posted: " + time + "</p><p class='user-time'>" + distance + "</p><button class='btn btn-secondary user-info-btn' id='user-info" + index + "'> More Info </button> <button class='btn btn-secondary user-add-btn' id='user-add" + index + "'> Join </button> <button class='btn btn-secondary user-delete-btn' id='user-delete" + index + "'> Delete Post </button></div></div>";
}

function createExpandedDiv(index, location, sport, name, url) {
  return "<div class='expanded" + index + "'><button class='btn btn-secondary' id='backBtn" + index + "' style='background-color: #163c61; margin-left: 20px;'>&#8592; Back</button><figure class='expanded-image' style='text-align: center;'><div class='img-max'><img class='rounded mx-auto d-block img-fluid' src='" + url + " alt='Responsive image'></div><br><figcaption>Location: " + location + " <button class='backBtn btn btn-secondary' id='mapBtn" + index + "' style='background-color: #163c61; margin-left: 3px;'>Directions <img src='images/gmapsicon.png' alt='google maps icon' width='25' height='25'></button></figcaption><figcaption style='text-align: center;'>Activity: " + sport + "</figcaption><figcaption style='text-align: center;'>Posted by: " + name + "</figcaption></figure></p></div></div>"
}


