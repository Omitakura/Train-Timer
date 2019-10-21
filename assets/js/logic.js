$('#train-time').mask('00:00');
$('#time-freq').mask('0#');
//initialize firebase
var config = {
    apikey: "AIzaSyCxuLoAiSG_d69-43Tj43hLX6lgzg6Dq04",
    authDomain: "train-schedule-451ab.firebaseapp.com",
    databaseURL: "https://train-schedule-451ab.firebaseio.com",
    projectId: "train-schedule-451ab",
    storageBucket: "",
    messagingSenderId: 559747835158,
};
firebase.initializeApp(config);
var database = firebase.database();

// Current Time
var updateTime = function () {
    var currentTime = moment();
    $("#current-time").html(moment(currentTime).format("H:mm:ss"));
};
setInterval(updateTime, 1000); // every second

//sumbit for new train
$("#submit").on("click", function () {
    event.preventDefault();
    //pushing newly submitted train data into firebase
    database.ref().push({
        name: $("#train-name").val().trim(),
        destination: $("#train-destination").val().trim(),
        starttime: $("#train-time").val().trim(),
        frequency: $("#time-freq").val().trim()
    });
    $("#train-name").val('');
    $("#train-destination").val('');
    $("#train-time").val('');
    $("#time-freq").val('');
});
database.ref().on("child_added", function (snapshot, prevChildKey) {
    // generate table elements for new train
    var $tr = $('<tr>').append(
        $('<td>').text(snapshot.val().name),
        $('<td>').text(snapshot.val().destination).addClass('destination'),
        $('<td>').text(snapshot.val().starttime).addClass('starttime'),
        $('<td>').text(snapshot.val().frequency).addClass('frequency'),
        $('<td>').addClass('arrival'),
        $('<td>').addClass('min-away'),
    ).appendTo('#train-table');
    update();
});
//do an update function every minutes
var date = new Date();
setTimeout(function () {
    setInterval(update, 60000);
    update();
}, (60 - date.getSeconds()) * 1000);

function update() {
    $('tbody tr').each(function () {

        var frequency = $(this).find('.frequency').html();
        var firstTime = $(this).find('.starttime').html();

        // First Time (pushed back 1 year to make sure it comes before current time)
        var firstTimeConverted = moment(firstTime, "hh:mm").subtract(1, "years");

        // Current Time
        var currentTime = moment();

        // Difference between the times
        var diffTime = moment().diff(moment(firstTimeConverted), "minutes");

        // Time apart (remainder)
        var tRemainder = diffTime % frequency;

        // Minute Until Train
        var minTillTrain = frequency - tRemainder;

        // Next Train
        var nextTrain = moment().add(minTillTrain, "hh:mm");

        $(this).find('.arrival').html((nextTrain).format("hh:mm"));
        $(this).find('.min-away').html(minTillTrain);

    });
}