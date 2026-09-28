function appUpdate() {
  if (!('serviceWorker' in navigator)) {
    return;
  }

  navigator.serviceWorker.getRegistration()
  .then(registration => {
    if (registration.waiting != null) {
      noticeUpdate('インストール済みの更新があります。アプリを再起動してください。');
    }
    else {
      registration.update()
      .then(registration => {
        const installingWorker = registration.installing;
        if (installingWorker != null) {
          installingWorker.onstatechange = e => {
            if (e.target.state == 'installed') {
              // registration.unregister();  // 効果が疑わしいので保留
              noticeUpdate('更新がインストールされました。アプリを再起動してください。');
            }
          }
        }
        else {
          document.getElementById("updateStatus").textContent = '更新はありませんでした。';
        }
      });
    }
  });
}

function noticeUpdate(message) {
  document.getElementById("checkUpdateButton").disabled = true;
  document.getElementById("updateStatus").textContent = message;
}