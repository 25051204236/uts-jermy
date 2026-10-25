    const guestNameEl = document.getElementById('guest-name-display');
    const urlParams = new URLSearchParams(window.location.search);
    const guestParam = urlParams.get('to') || urlParams.get('name');
    if (guestParam && guestNameEl) {
      guestNameEl.textContent = guestParam;
    }

    const cover = document.getElementById('invitation-cover');
    const openBtn = document.getElementById('btn-open-invitation');
    const musicBtn = document.getElementById('music-toggle');
    const music = document.getElementById('bg-music');
    const musicStatus = document.getElementById('music-status');
    const musicStartAt = 0;
    let startPositionSet = false;

    if (music) music.volume = 0.5;

    function setMusicPlaying(playing) {
      if (!musicBtn) return;

      musicBtn.classList.toggle('playing', playing);
      musicBtn.setAttribute('aria-pressed', String(playing));
      musicBtn.setAttribute('aria-label', playing ? 'Pause music' : 'Play music');
      musicBtn.title = playing ? 'Pause music' : 'Play music';
    }

    function showMusicError(message) {
      if (musicStatus) {
        musicStatus.textContent = message;
        musicStatus.classList.remove('visually-hidden');
      }
    }

    function startMusic() {
      if (!music) return;

      if (!startPositionSet && music.readyState >= HTMLMediaElement.HAVE_METADATA) {
        music.currentTime = Math.min(musicStartAt, Math.max(0, music.duration - 1));
        startPositionSet = true;
      }

      music.play().then(() => {
        setMusicPlaying(true);
        if (musicStatus) {
          musicStatus.textContent = '';
          musicStatus.classList.add('visually-hidden');
        }
      }).catch((error) => {
        setMusicPlaying(false);
        showMusicError('Music could not be played. Check that Flying_Dutchman_mp3.mp3.mpeg is in the project folder.');
        console.error('Failed to play background music:', error);
      });
    }

    if (music) {
      music.addEventListener('loadedmetadata', () => {
        if (!startPositionSet) {
          music.currentTime = Math.min(musicStartAt, Math.max(0, music.duration - 1));
          startPositionSet = true;
        }
      });
      music.addEventListener('error', () => {
        showMusicError('Flying_Dutchman_mp3.mp3.mpeg is missing or could not be read.');
      });
    }

    if (openBtn && cover) {
      openBtn.addEventListener('click', () => {
        cover.classList.add('opened');
        document.body.classList.remove('locked');
        startMusic();
      });
    }

    if (musicBtn && music) {
      musicBtn.addEventListener('click', () => {
        if (music.paused) {
          startMusic();
        } else {
          music.pause();
          setMusicPlaying(false);
        }
      });
    }

    const weddingDate = new Date('November 28, 2026 09:00:00').getTime();
    const countdown = document.getElementById('countdown');

    if (countdown) {
      const countdownUnits = [
        ['cd-days', 864e5],
        ['cd-hours', 36e5, 24],
        ['cd-minutes', 6e4, 60],
        ['cd-seconds', 1e3, 60]
      ].map(([id, divisor, modulus]) => [
        countdown.querySelector(`#${id}`),
        divisor,
        modulus
      ]);

      function updateCountdown() {
        const diff = Math.max(0, weddingDate - Date.now());

        countdownUnits.forEach(([element, divisor, modulus]) => {
          if (!element) return;
          const value = Math.floor(diff / divisor) % (modulus || Infinity);
          element.textContent = String(value).padStart(2, '0');
        });
      }

      setInterval(updateCountdown, 1000);
      updateCountdown();
    }

    const lightboxModal = new bootstrap.Modal(document.getElementById('lightboxModal'));
    function openLightbox(src) {
      document.getElementById('lightbox-img').src = src;
      lightboxModal.show();
    }

    function copyText(text, btnElement) {
      const originalHTML = btnElement.innerHTML;
      const setCopiedState = () => {
        btnElement.innerHTML = '<i class="bi bi-check2 me-1"></i>Copied!';
        setTimeout(() => {
          btnElement.innerHTML = originalHTML;
        }, 2000);
      };

      if (navigator.clipboard && window.isSecureContext) {
        navigator.clipboard.writeText(text).then(setCopiedState).catch(() => {
          document.execCommand('copy');
          setCopiedState();
        });
        return;
      }

      const tempInput = document.createElement('textarea');
      tempInput.value = text;
      document.body.appendChild(tempInput);
      tempInput.select();
      document.execCommand('copy');
      document.body.removeChild(tempInput);
      setCopiedState();
    }

    const rsvpForm = document.getElementById('rsvp-form');
    const wishList = document.getElementById('wish-list');
    const wishCount = document.getElementById('wish-count');
    let totalWishes = 0;

    if (rsvpForm && wishList && wishCount) {
      rsvpForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const name = document.getElementById('rsvp-name').value.trim();
        const status = document.getElementById('rsvp-status').value;
        const message = document.getElementById('rsvp-message').value.trim();

        if (!name || !message) return;

        const badgeClass = status === 'Attending'
          ? 'bg-success-subtle text-success'
          : 'bg-secondary-subtle text-secondary';

        const newWish = document.createElement('div');
        newWish.className = 'wish-item';
        newWish.innerHTML = `
          <div class="d-flex justify-content-between align-items-center mb-1">
            <strong class="serif fs-5">${name.replace(/</g, "&lt;")}</strong>
            <span class="badge ${badgeClass} small">${status}</span>
          </div>
          <p class="small text-muted mb-1">${message.replace(/</g, "&lt;")}</p>
          <small class="text-muted" style="font-size: 0.7rem;">Just now</small>
        `;

        wishList.prepend(newWish);
        totalWishes++;
        wishCount.textContent = `${totalWishes} Wishes`;
        rsvpForm.reset();
      });
    }

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
        } else {
          entry.target.classList.remove('visible');
        }
      });
    }, { threshold: 0.15 });

    document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
