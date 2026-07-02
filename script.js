// Toggle da sidebar e destaque de link ativo
(function () {
    const toggle = document.getElementById('navToggle');
    const toc = document.getElementById('toc');
    const links = toc ? toc.querySelectorAll('a[href^="#"]') : [];
    const progressBar = document.getElementById('readingProgressBar');
    const themeToggle = document.getElementById('themeToggle');
    const courseProgressText = document.getElementById('courseProgressText');
    const courseProgressBar = document.getElementById('courseProgressBar');
    const certificateCard = document.getElementById('certificateCard');
    const downloadCertificateBtn = document.getElementById('downloadCertificateBtn');
    const chapterSections = Array.from(document.querySelectorAll('main > section:not(.course-progress-card)'));
    const totalChapters = chapterSections.length;
    const storageKey = 'course-progress';

    function updateReadingProgress() {
        const scrollTop = window.scrollY || window.pageYOffset || 0;
        const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
        const progress = maxScroll > 0 ? Math.min(100, Math.max(0, (scrollTop / maxScroll) * 100)) : 0;

        if (progressBar) {
            progressBar.style.width = `${progress}%`;
        }
    }

    function renderProgress() {
        const stored = (function(){ try { return JSON.parse(localStorage.getItem(storageKey) || '[]'); } catch(e){ return []; } })();
        const completed = new Set(stored);
        const completedCount = completed.size;
        const progressPercent = totalChapters > 0 ? (completedCount / totalChapters) * 100 : 0;

        if (courseProgressText) {
            courseProgressText.textContent = `${completedCount} de ${totalChapters} capítulos concluídos`;
        }

        if (courseProgressBar) {
            courseProgressBar.style.width = `${progressPercent}%`;
        }

        chapterSections.forEach((section, index) => {
            const chapterId = section.id || `chapter-${index + 1}`;
            const button = section.querySelector('.chapter-button');
            const status = section.querySelector('.chapter-status');
            const completedState = completed.has(chapterId);

            if (button) {
                button.classList.toggle('is-complete', completedState);
                button.textContent = completedState ? 'Capítulo concluído ✓' : 'Concluir capítulo';
            }

            if (status) {
                status.textContent = completedState ? 'Concluído' : 'Em andamento';
            }
        });

        const allCompleted = completedCount === totalChapters;
        if (certificateCard) {
            certificateCard.classList.toggle('is-visible', allCompleted);
        }
    }

    function markChapterComplete(chapterId) {
        const stored = (function(){ try { return JSON.parse(localStorage.getItem(storageKey) || '[]'); } catch(e){ return []; } })();
        const completed = new Set(stored);
        completed.add(chapterId);
        try {
            localStorage.setItem(storageKey, JSON.stringify(Array.from(completed)));
        } catch (e) { /* ignore */ }
        renderProgress();
    }

    function downloadCertificateImage() {
        const name = window.prompt('Digite o nome que deve aparecer no certificado:', 'Aluno(a)') || 'Aluno(a)';
        const canvas = document.createElement('canvas');
        canvas.width = 1600;
        canvas.height = 1000;
        const ctx = canvas.getContext('2d');

        if (!ctx) return;

        const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
        gradient.addColorStop(0, '#fff9e6');
        gradient.addColorStop(1, '#ffe082');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        ctx.strokeStyle = '#8d6e63';
        ctx.lineWidth = 20;
        ctx.strokeRect(40, 40, canvas.width - 80, canvas.height - 80);

        ctx.strokeStyle = '#d4a017';
        ctx.lineWidth = 6;
        ctx.strokeRect(70, 70, canvas.width - 140, canvas.height - 140);

        ctx.fillStyle = '#6d4c00';
        ctx.font = 'bold 56px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('Certificado de Conclusão', canvas.width / 2, 220);

        ctx.font = '34px Arial';
        ctx.fillText('Este certificado comprova que o(a) aluno(a):', canvas.width / 2, 340);

        ctx.font = 'bold 54px Georgia';
        ctx.fillStyle = '#1b4f72';
        ctx.fillText(name, canvas.width / 2, 430);

        ctx.font = '34px Arial';
        ctx.fillStyle = '#6d4c00';
        ctx.fillText('concluiu com sucesso o Manual Prático de Direção Veicular.', canvas.width / 2, 520);
        ctx.fillText(`Emitido em ${new Date().toLocaleDateString('pt-BR')}.`, canvas.width / 2, 600);

        ctx.font = 'italic 26px Georgia';
        ctx.fillText('Parabéns por sua dedicação e aprendizado.', canvas.width / 2, 760);

        const link = document.createElement('a');
        link.download = 'certificado-conclusao.png';
        link.href = canvas.toDataURL('image/png');
        link.click();
    }

    function initQuizzes() {
        const questions = document.querySelectorAll('.quiz-question');

        questions.forEach(question => {
            const options = question.querySelectorAll('.quiz-option');
            const feedback = question.querySelector('.quiz-feedback');

            options.forEach(option => {
                const input = option.querySelector('input[type="radio"]');
                input.addEventListener('change', () => {
                    const selected = question.querySelector('input[type="radio"]:checked');
                    if (!selected) return;

                    const correctOption = question.querySelector('input[data-correct="true"]');
                    const correctWrapper = correctOption ? correctOption.closest('.quiz-option') : null;
                    const selectedWrapper = selected ? selected.closest('.quiz-option') : null;
                    const isCorrect = selected === correctOption;

                    options.forEach(item => {
                        const radio = item.querySelector('input[type="radio"]');
                        item.classList.remove('is-selected', 'is-correct', 'is-wrong');
                        if (radio === selected) {
                            item.classList.add('is-selected');
                        }
                        if (radio === correctOption) {
                            item.classList.add('is-correct');
                        }
                        if (radio === selected && !isCorrect) {
                            item.classList.add('is-wrong');
                        }
                    });

                    if (feedback) {
                        feedback.textContent = isCorrect
                            ? `✅ Alternativa correta: ${correctWrapper ? correctWrapper.dataset.label : ''}`
                            : `❌ Alternativa correta: ${correctWrapper ? correctWrapper.dataset.label : ''}`;
                        feedback.className = 'quiz-feedback';
                        feedback.classList.add(isCorrect ? 'is-correct' : 'is-wrong');
                    }
                });
            });
        });
    }

    function setExpanded(expanded) {
        toggle.setAttribute('aria-expanded', String(expanded));
        toc.setAttribute('aria-hidden', String(!expanded));
        document.body.classList.toggle('toc-open', expanded);
        try {
            localStorage.setItem('toc-expanded', expanded ? '1' : '0');
        } catch (e) { /* ignore */ }
    }

    function initThemeToggle() {
        if (!themeToggle) return;

        const savedTheme = (function(){ try { return localStorage.getItem('theme-mode'); } catch(e){return null;} })();
        const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
        const shouldUseDark = savedTheme === 'dark' || (!savedTheme && prefersDark);

        document.body.classList.toggle('dark-mode', shouldUseDark);
        themeToggle.setAttribute('aria-pressed', shouldUseDark ? 'true' : 'false');
        themeToggle.textContent = shouldUseDark ? '☀️' : '🌙';

        themeToggle.addEventListener('click', () => {
            const isDark = document.body.classList.toggle('dark-mode');
            themeToggle.setAttribute('aria-pressed', isDark ? 'true' : 'false');
            themeToggle.textContent = isDark ? '☀️' : '🌙';
            try {
                localStorage.setItem('theme-mode', isDark ? 'dark' : 'light');
            } catch (e) { /* ignore */ }
        });
    }

    // inicializar estado
    const saved = (function(){ try { return localStorage.getItem('toc-expanded'); } catch(e){return null;} })();
    const isExpanded = saved === null ? true : saved === '1';
    if (toggle && toc) {
        setExpanded(isExpanded);

        toggle.addEventListener('click', function () {
            const expanded = toggle.getAttribute('aria-expanded') === 'true';
            setExpanded(!expanded);
        });

        // fechar toc quando clicar em um link (em mobile)
        links.forEach(a => {
            a.addEventListener('click', () => {
                if (window.innerWidth <= 800) setExpanded(false);
            });
        });

        // destacar link ativo ao rolar
        function onScroll() {
            let current = null;
            for (let i = 0; i < links.length; i++) {
                const id = links[i].getAttribute('href').slice(1);
                const section = document.getElementById(id);
                if (!section) continue;
                const rect = section.getBoundingClientRect();
                if (rect.top <= 120) current = links[i];
            }
            links.forEach(l => l.classList.remove('active'));
            if (current) current.classList.add('active');
        }

        document.addEventListener('scroll', () => {
            onScroll();
            updateReadingProgress();
        }, { passive: true });

        window.addEventListener('resize', () => {
            // se for desktop, sempre abrir
            if (window.innerWidth > 800) {
                setExpanded(true);
            } else {
                // em mobile mantemos o estado salvo
                const saved = (function(){ try { return localStorage.getItem('toc-expanded'); } catch(e){return null;} })();
                if (saved === '1') setExpanded(true);
            }

            updateReadingProgress();
        });

        initThemeToggle();
        initQuizzes();

        chapterSections.forEach(section => {
            const button = section.querySelector('.chapter-button');
            if (!button) return;
            const chapterId = section.id || 'chapter';
            button.addEventListener('click', () => markChapterComplete(chapterId));
        });

        if (downloadCertificateBtn) {
            downloadCertificateBtn.addEventListener('click', downloadCertificateImage);
        }

        renderProgress();

        // rodar uma vez
        onScroll();
        updateReadingProgress();
    }
})();
