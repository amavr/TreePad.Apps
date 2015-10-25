chrome.app.runtime.onLaunched.addListener(function () {

    chrome.app.window.create('window.html', {
        'outerBounds': {
            'left': 20,
            'top': 20,
            'width': 800,
            'height': 600
        }
    });

});
