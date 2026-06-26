(function () {
  var config = window.APP_CONFIG || {};
  var environment = config.environment || "local";
  var label = document.getElementById("environment-label");

  if (label) {
    label.textContent = "Environment: " + environment;
  }
})();
