
var username = document.getElementById('username');
var issueList = document.getElementById('issues');
var githubToken = document.getElementById('githubToken');
var saveButton = document.getElementById('save');

var myToken = localStorage.getItem('githubToken');

var refreshIssues = function(cache) {
  var githubToken = localStorage.getItem('githubToken');

  while (issueList.firstChild) {
    issueList.removeChild(issueList.firstChild);
  }

  GitHub.getMyIssues(githubToken, cache).then(function (issues) {
    (issues).forEach(function(issue) {
      var li = document.createElement('li');
      li.innerText = '#' + issue.number + ' - ' + issue.title;

      issueList.appendChild(li);
    });
  });
  GitHub.getMe(githubToken, cache).then(function (me) {
    username.textContent = me.login;
  });
};

if (myToken !== null) {
  saveButton.textContent = 'Refresh';
  refreshIssues(true);
  githubToken.value = myToken;
}

// save our Github token
saveButton.addEventListener('click', function() {
  localStorage.setItem('githubToken', githubToken.value);
  refreshIssues(false);
  saveButton.textContent = 'Refresh';
});
