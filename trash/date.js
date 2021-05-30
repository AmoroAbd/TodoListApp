function getDate() {
  var today = new Date();
  var options = {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  };
  var day = today.toLocaleDateString("en-US", options);
  return day;
}
module.exports = getDate;
