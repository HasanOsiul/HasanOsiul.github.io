// Download single image
document.querySelectorAll('.info button').forEach(btn => {
  btn.addEventListener('click', e => {
    const url = e.target.dataset.src;
    const a = document.createElement('a');
    a.href = url;
    a.download = url.split('/').pop();
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  });
});

// Simple search/filter by title
const searchInput = document.getElementById('search');
searchInput.addEventListener('input', () => {
  const term = searchInput.value.toLowerCase();
  document.querySelectorAll('.card').forEach(card => {
    const title = card.dataset.title.toLowerCase();
    card.style.display = title.includes(term) ? '' : 'none';
  });
});
