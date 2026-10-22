/*
 * Base de données locale pour la version autonome (GitHub Pages ou fichier ouvert en local).
 * Reproduit la petite partie de l'API « window.claude » utilisée par le site :
 *   - db : documents et collections, avec abonnement aux changements (onSnapshot)
 *   - user : l'utilisateur local a tous les droits
 *   - downloads : téléchargement d'un fichier (export PDF, export des données)
 * Les données de départ viennent de data/data.js (window.__SEED).
 * Ce que le staff ajoute ou modifie est gardé dans le navigateur (localStorage).
 */
(function(){
  if (window.claude && window.claude.use) return; // déjà dans Claude : on ne touche à rien
  var KEY = 'nissa-pro-db-v1';
  var SEED = window.__SEED || { matchs: [], effectif: { joueurs: [] }, minutes: { minutes: {} }, logos: {} };

  function seedDocs(){
    var d = {};
    (SEED.matchs || []).forEach(function(m){ var x = Object.assign({}, m); delete x.id; d['matchs/' + m.id] = x; });
    Object.keys(SEED.logos || {}).forEach(function(k){ d['logos/' + k] = SEED.logos[k]; });
    if (SEED.effectif) d['effectif/saison'] = SEED.effectif;
    if (SEED.minutes) d['temps/saison'] = SEED.minutes;
    return d;
  }
  var local = { docs: {}, deleted: {} };
  try { local = JSON.parse(localStorage.getItem(KEY)) || local; } catch (e) {}
  function all(){
    var d = seedDocs();
    Object.keys(local.deleted || {}).forEach(function(p){ delete d[p]; });
    Object.keys(local.docs || {}).forEach(function(p){ d[p] = local.docs[p]; });
    return d;
  }
  function persist(){ try { localStorage.setItem(KEY, JSON.stringify(local)); } catch (e) { console.warn('Stockage local impossible', e); throw { code: 'quota_exceeded', message: 'Stockage du navigateur plein' }; } }

  var listeners = [];
  function notify(path){
    listeners.forEach(function(l){ if (l.match(path)) setTimeout(l.fire, 0); });
  }
  function clone(o){ return JSON.parse(JSON.stringify(o)); }

  function docRef(path){
    return {
      set: function(obj){ local.docs[path] = clone(obj); delete local.deleted[path]; persist(); notify(path); return Promise.resolve(); },
      delete: function(){ delete local.docs[path]; local.deleted[path] = 1; persist(); notify(path); return Promise.resolve(); },
      get: function(){ var d = all()[path]; return Promise.resolve({ exists: !!d, id: path.split('/').pop(), data: function(){ return d ? clone(d) : undefined; } }); },
      onSnapshot: function(cb){
        var l = { match: function(p){ return p === path; }, fire: function(){ var d = all()[path]; cb({ exists: !!d, id: path.split('/').pop(), data: function(){ return d ? clone(d) : undefined; } }); } };
        listeners.push(l); setTimeout(l.fire, 0);
        return function(){ listeners = listeners.filter(function(x){ return x !== l; }); };
      }
    };
  }
  function collRef(name){
    return {
      doc: function(id){ return docRef(name + '/' + id); },
      onSnapshot: function(cb){
        var l = { match: function(p){ return p.indexOf(name + '/') === 0 && p.split('/').length === name.split('/').length + 1; },
          fire: function(){ var d = all(); var docs = Object.keys(d).filter(l.match).map(function(p){ var v = d[p]; return { id: p.split('/').pop(), exists: true, data: function(){ return clone(v); } }; }); cb({ docs: docs, size: docs.length, empty: !docs.length }); } };
        listeners.push(l); setTimeout(l.fire, 0);
        return function(){ listeners = listeners.filter(function(x){ return x !== l; }); };
      }
    };
  }
  var db = { doc: docRef, collection: collRef };
  var user = { isOwner: function(){ return Promise.resolve(true); }, canEdit: function(){ return Promise.resolve(true); }, can: function(){ return Promise.resolve(true); } };
  var downloads = { save: function(o){ var a = document.createElement('a'); a.href = URL.createObjectURL(o.data instanceof Blob ? o.data : new Blob([o.data])); a.download = o.filename || 'fichier'; document.body.appendChild(a); a.click(); setTimeout(function(){ URL.revokeObjectURL(a.href); a.remove(); }, 1000); return Promise.resolve(); } };
  window.claude = { use: function(name){ return Promise.resolve(name === 'db' ? db : name === 'user' ? user : name === 'downloads' ? downloads : null); } };

  // Export des données (pour mettre à jour data/data.js dans le dépôt) et retour aux données du dépôt
  function exportSeed(){
    var d = all(), out = { matchs: [], effectif: d['effectif/saison'] || { joueurs: [] }, minutes: d['temps/saison'] || { minutes: {} }, logos: {} };
    Object.keys(d).forEach(function(p){
      var s = p.split('/');
      if (s[0] === 'matchs' && s.length === 2) out.matchs.push(Object.assign({ id: s[1] }, d[p]));
      if (s[0] === 'logos' && s.length === 2) out.logos[s[1]] = d[p];
    });
    out.matchs.sort(function(a, b){ return String(a.id).localeCompare(String(b.id)); });
    var txt = '/* Exporté depuis le site le ' + new Date().toLocaleString('fr-FR') + ' */\nwindow.__SEED = ' + JSON.stringify(out) + ';\n';
    downloads.save({ filename: 'data.js', data: new Blob([txt], { type: 'text/javascript' }) });
  }
  document.addEventListener('DOMContentLoaded', function(){
    var bar = document.querySelector('.bar-tools .right'); if (!bar) return;
    var exp = document.createElement('button'); exp.type = 'button'; exp.className = 'ghost'; exp.textContent = 'Exporter les données';
    exp.title = 'Télécharger data.js avec tous les matchs, l’effectif et les minutes (à remplacer dans le dépôt)';
    exp.addEventListener('click', exportSeed);
    var rst = document.createElement('button'); rst.type = 'button'; rst.className = 'danger'; rst.textContent = 'Données du dépôt';
    rst.title = 'Effacer les modifications faites dans ce navigateur et revenir aux données publiées';
    rst.addEventListener('click', function(){
      if (!rst.classList.contains('armed')) { rst.classList.add('armed'); rst.textContent = 'Confirmer'; setTimeout(function(){ rst.classList.remove('armed'); rst.textContent = 'Données du dépôt'; }, 4000); return; }
      try { localStorage.removeItem(KEY); } catch (e) {} location.reload();
    });
    bar.insertBefore(rst, bar.firstChild); bar.insertBefore(exp, bar.firstChild);
  });
})();
