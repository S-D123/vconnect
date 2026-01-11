// This file is intentionally left blank.

handleLogin = () => {
    document.querySelector('.login').classList.add('hide');
    document.querySelector('.home').classList.remove('hide');
}

handleLogout = () => {
    document.querySelector('.home').classList.add('hide');
    document.querySelector('.login').classList.remove('hide');
}