// Toggle da sidebar e destaque de link ativo
(function () {
    const toggle = document.getElementById('navToggle');
    const toc = document.getElementById('toc');
    const links = toc ? toc.querySelectorAll('a[href^="#"]') : [];

    function setExpanded(expanded) {
        toggle.setAttribute('aria-expanded', String(expanded));
        toc.setAttribute('aria-hidden', String(!expanded));
        document.body.classList.toggle('toc-open', expanded);
        try {
            localStorage.setItem('toc-expanded', expanded ? '1' : '0');
        } catch (e) { /* ignore */ }
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

        document.addEventListener('scroll', onScroll, { passive: true });
        window.addEventListener('resize', () => {
            // se for desktop, sempre abrir
            if (window.innerWidth > 800) {
                setExpanded(true);
            } else {
                // em mobile mantemos o estado salvo
                const saved = (function(){ try { return localStorage.getItem('toc-expanded'); } catch(e){return null;} })();
                if (saved === '1') setExpanded(true);
            }
        });

        // rodar uma vez
        onScroll();
    }
})();
