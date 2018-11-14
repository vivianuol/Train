
// 1. Initialize Firebase
var config = {
    apiKey: "AIzaSyA8yejvOax8ekWlqMLZPWvKviS9qw-gvCw",
    authDomain: "practice1-469d1.firebaseapp.com",
    databaseURL: "https://practice1-469d1.firebaseio.com",
    projectId: "practice1-469d1",
    storageBucket: "practice1-469d1.appspot.com",
    messagingSenderId: "839189276083"
};

firebase.initializeApp(config);


var database = firebase.database();


var firstTrain

// 2. Button for adding trains
$("#add-train").click(function (event) {
    event.preventDefault();

    // Grabs user input
    var trainName = $("#name-input").val().trim()
    var destination = $("#destination-input").val().trim()
    var firstTrain = $("#firstTrain-input").val().trim()
    var frequency = $("#frequency-input").val().trim()

    // Do math
    var z=calculateNextArrival(firstTrain, frequency)

    // add arrival, minutesAway to trainTime
    var arrivalR = z[0]
    var minutesAwayR = z[1]

    // Creates local "temporary" object for holding traintime data

    var trainTime = {
        name: trainName,
        destination: destination,
        firstTrain: firstTrain,
        frequency: frequency,
        arrival: arrivalR,
        minutesAway: minutesAwayR
    };

    console.log(trainTime)

    // Uploads traintime data to the database

    database.ref("train").push(trainTime)

    // Logs everything to console
    console.log("trainname: " + trainTime.name);
    console.log("destination: " + trainTime.destination);
    console.log("firstTrain: " + trainTime.firstTrain);
    console.log("frecuency: " + trainTime.frequency);
    console.log("frecuency: " + trainTime.arrival);
    console.log("frecuency: " + trainTime.minutesAway);

    // Clears all of the text-boxes
    $("#name-input").text("");
    $("#destination-input").text("");
    $("#firstTrain-input").text("");
    $("#frequency-input").text("")


})





// 3. Create Firebase event for adding train to the database and a row in the html when a user adds an entry

database.ref("train").on("child_added", function (childsnapshot) {
    console.log("snapshot: " + childsnapshot.val())
    console.log("snapshot: " + childsnapshot.ref)

    // Store everything into a variable
    var name = childsnapshot.val().name;
    var destination = childsnapshot.val().destination;
    var firstTrain = childsnapshot.val().firstTrain;
    var frequency = childsnapshot.val().frequency;
    var arrival = childsnapshot.val().arrival;
    var minutesAway = childsnapshot.val().minutesAway;

    // display train information to train timetable
    var newRow = $("<tr>")
    newRow.append(
        $("<td>").text(name),
        $("<td>").text(destination),
        $("<td>").text(frequency),
        $("<td>").text(arrival),
        $("<td>").text(minutesAway)
    )

    $(".table>tbody").append(newRow)
})

// Every minute, grab what's in firebase ONCE and re-calculate the times

function updateTimes() {
    $(".table>tbody").empty()

    database.ref("train").once("value", function (childsnapshot) {
        console.log(childsnapshot.val())

        var refs = Object.keys(childsnapshot.val())
        for (var k = 0; k < refs.length; k++) {
            // Store everything into a variable.  
            console.log("ref: " + refs[k])  
            var name = childsnapshot.val()[refs[k]].name;
            var destination = childsnapshot.val()[refs[k]].destination;
            var firstTrain = childsnapshot.val()[refs[k]].firstTrain;
            var frequency = childsnapshot.val()[refs[k]].frequency;

            console.log("+++++firstTrain: " + firstTrain)
            console.log("+++frequency: " + frequency)

            //do math
            var z=calculateNextArrival(firstTrain, frequency)

            var arrival = z[0];
            var minutesAway = z[1];

            // display train information to train timetable
            var newRow = $("<tr>")
            newRow.append(
                $("<td>").text(name),
                $("<td>").text(destination),
                $("<td>").text(frequency),
                $("<td>").text(arrival),
                $("<td>").text(minutesAway)
            )

            $(".table>tbody").append(newRow)
        }

    });
};

setInterval(updateTimes, 30000);



   
function calculateNextArrival(fT, F) {
       //var fT = firstTrain
      // var F = frequency
   

    // First Time (pushed back 1 year to make sure it comes before current time)
    var firstTrainConvert = moment(fT, "HH:mm").subtract(1, "years")


    // Current Time
    var currentTime = moment()
    console.log("CURRENT TIME: " + moment(currentTime).format("hh:mm"));

    // Difference between the times
    var diffTime = moment().diff(firstTrainConvert, "minutes");
    console.log("DIFFERENCE IN TIME: " + diffTime);

    // Time apart (remainder)   
    var remainder = diffTime % F;
    console.log(remainder);

    // Minute Until Train
    var minutesAway = F - remainder;
    console.log(minutesAway)

    // Next Train
    var nextTrain = moment().add(minutesAway, "minutes")
    console.log(nextTrain)

    var arrival = moment(nextTrain).format("HH:mm")

    var calResults = [arrival, minutesAway]

    return calResults

}
