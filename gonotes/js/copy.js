document.addEventListener('DOMContentLoaded', function () {
    document.querySelectorAll('pre').forEach(function (pre) {
        var code = pre.querySelector('code');
        if (!code) return;

        var button = document.createElement('button');
        button.className = 'copy-btn';
        button.textContent = 'Copy';
        pre.appendChild(button);

        button.addEventListener('click', function () {
            navigator.clipboard.writeText(code.innerText).then(function () {
                button.textContent = 'Copied!';
                button.classList.add('copy-btn--success');
                setTimeout(function () {
                    button.textContent = 'Copy';
                    button.classList.remove('copy-btn--success');
                }, 1500);
            });
        });
    });
});
