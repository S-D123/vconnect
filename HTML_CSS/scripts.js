handleLogin = () => {
    document.querySelector('.login').classList.add('hide');
    document.querySelector('.home').classList.remove('hide');
}

handleLogout = () => {
    document.querySelector('.home').classList.add('hide');
    document.querySelector('.login').classList.remove('hide');
}

document.getElementById('postButton').addEventListener('click', function () {
    const content = document.getElementById('postContent').value.trim();
    const media = document.getElementById('postMedia').files[0];
    const link = document.getElementById('postLink').value.trim();

    // Prevent creating a new post if all inputs are empty
    if (!content && !media && !link) {
        alert('Please provide content, media, or a link to create a post.');
        return;
    }

    const feedContainer = document.getElementById('feedContainer');
    const postDiv = document.createElement('div');
    postDiv.classList.add('post');

    // Add text content
    if (content) {
        const textParagraph = document.createElement('p');
        textParagraph.textContent = content;
        postDiv.appendChild(textParagraph);
    }

    // Add media (image or video)
    if (media) {
        const mediaElement = media.type.startsWith('image/')
            ? document.createElement('img')
            : document.createElement('video');
        mediaElement.src = URL.createObjectURL(media);
        if (mediaElement.tagName === 'VIDEO') {
            mediaElement.controls = true;
        }
        mediaElement.style.maxWidth = '50%';
        postDiv.appendChild(mediaElement);
    }

    // Add hyperlink
    if (link) {
        const linkElement = document.createElement('a');
        linkElement.href = link;
        linkElement.textContent = 'Check this out!';
        linkElement.target = '_blank';
        postDiv.appendChild(linkElement);
    }

    // Add the post to the feed
    feedContainer.prepend(postDiv);

    // Clear input fields
    document.getElementById('postContent').value = '';
    document.getElementById('postMedia').value = '';
    document.getElementById('postLink').value = '';
});