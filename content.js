'use strict';
(() => {
	// if (Helper.isBankx() || Helper.isExacom()) {
		///////TEST////////
		
		///////////////////
		let Share = {};
		// toggle switch
		var appEnable = true;
		chrome.storage.sync.get('appEnable', function(data) {
			appEnable = data.appEnable;
		});
		// appEnable = appEnable && Helper.isBankx();
		if (appEnable) {
			// const FILE_NAME = window.location.pathname.substring(window.location.pathname.lastIndexOf('/')+1);
			const [ORGINE_NAME, ORGINE] = Helper.getOrigine();
			Share = {
				'dockId' : 'dock',
				'origin_name' :  ORGINE_NAME,
				'origin_value' : ORGINE
			};
			// auto fill password in admin
			let mdp = document.getElementsByName("motdepasse");
			if (mdp.length) mdp[0].value='theobald';

			if (ORGINE == 'authent') {
				let username = document.getElementsByName("form_nom_acces")[0];
				let password = document.getElementsByName("form_mot_de_passe")[0];
				if (username) {
					username.addEventListener('focus', (e) => e.target.value='');
					username.addEventListener('input', (e) => {
						let ulist = [
							'jduchemin',
							'glafarge',
							'jlafarge',
							'cpagnol',
							'jalonso',
							'tandre',
							'sbombart',
							'lmeng',
							'exalog'
						];
						let found = ulist.find(n => e.target.value.startsWith(n.substring(0, 2)));
						if (found) e.target.value = found; else return;
						password.value = '111111';
						let formValider = document.querySelector('[name=form_valider]')
						if (formValider) {
							formValider.click();
						}
					});
				}
				// password.focus();
				//username.value='jduchemin';
				password.value='111111';
			} else if (document.getElementById("grille")) {
				let grid = document.getElementById("grille");
				// auto validate grid
				for (let i=0; i<4; i++) {
					grid.click();
				}
				// if (ORGINE === "authent_grid") {//auto submit
					document.getElementById("form_validate_grid").click();
				// }
			} else if(ORGINE == 'multiple_sessions_confirmer') {
				let userSession = document.getElementById("form_confirmation_bouton_annuler");
				if (userSession) {
					userSession.click(); 
				}
			} else {}

			//////////Button/Hint//////////
			let inputs = document.querySelectorAll('[name]');
			inputs.forEach(function(element, index) {
				element.addEventListener('auxclick', (e) => {//not left click (rightClick or mouseWheelClick)
					if (e.button == 1 || e.button == 4) {//mouse wheel click || mouse ? click
						e.preventDefault();
						e.stopPropagation();
						Helper.showPopoverOn(element);
					}
				});
			});
			var clickedEle = null;
			document.addEventListener("contextmenu", function(event){
				clickedEle = event.target;
			}, true);
			chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
				if (request === "showPopover") {
					Helper.showPopoverOn(clickedEle);
				}
			});

			//////////FloatingPanel//////////
			let draggable = new Draggable(Share.dockId);
			draggable.setTitle('Information2');
			var draggableElement = draggable.getElement();
			document.body.appendChild(draggableElement);
			setTimeout(() => draggable.collapse(true), 0);
		}
		chrome.storage.sync.get(null, function(items) {
			for (let key in items) {
				let val = items[key];
				switch(key) {
					case 'showDock':
						if (draggableElement) {
							draggableElement.style.display = (appEnable && val) ? 'inherit' : 'none';
							// console.log('display = ',appEnable);
						}
						break;
					case 'darkMode':
						(appEnable && val) ? document.body.classList.add('dark-mode') : document.body.classList.remove('dark-mode');
						break;
					case 'appEnable':
						if (val) {
							chrome.storage.sync.get('showDock', function(data) {
								if (draggableElement) {
									draggableElement.style.display = data.showDock ? 'inherit' : 'none';
								}
							});
							chrome.storage.sync.get('darkMode', function(data) {
								data.darkMode ? document.body.classList.add('dark-mode') : document.body.classList.remove('dark-mode');
							});
						} else {
							if (draggableElement) {
								draggableElement.style.display = 'none';
							}
							document.body.classList.remove('dark-mode');
						}
						break;
				}
			}
		});
		chrome.storage.onChanged.addListener(function(changes, namespace) {
			chrome.storage.sync.get('appEnable', function(data) {
				appEnable = data.appEnable;
			});
			for (let key in changes) {
				let newValue = changes[key].newValue;
				switch(key) {
					case 'showDock':
						draggableElement.style.display = (appEnable && newValue) ? 'inherit' : 'none';
						console.log('change display = ',appEnable);
						break;
					case 'darkMode':
						(appEnable && newValue) ? document.body.classList.add('dark-mode') : document.body.classList.remove('dark-mode');
						break;
					case 'appEnable':
						if (newValue) {
							chrome.storage.sync.get('showDock', function(data) {
								draggableElement.style.display = data.showDock ? 'inherit' : 'none';
							});
							chrome.storage.sync.get('darkMode', function(data) {
								data.darkMode ? document.body.classList.add('dark-mode') : document.body.classList.remove('dark-mode');
							});
						} else {
							draggableElement.style.display = 'none';
							document.body.classList.remove('dark-mode');
						}
						break;
				}
				//console.log('Storage key "%s" in namespace "%s" changed. Old value was "%s", new value is "%s".', key, namespace, changes[key].oldValue, changes[key].newValue);
			}
		});
		
		
		// inject to conent
		function injection() {
			console.log('Bankx-helper : Content script injected.');
			let Share = JSON.parse('__Share__');
			let draggableElement = document.getElementById(Share.dockId);
			if (draggableElement) {
				let content = draggableElement.querySelector('.draggable-body');
				let favList = Array.from(document.querySelectorAll(".fav-star.active+a"));
				let favorite = '';
				if (favList.length > 0) {
					favorite += '<ul style="margin-left:18px">';
					favList.forEach(el => {
						favorite += `<li>${el.outerHTML}</li>`;
					});
					favorite += '</ul>';
				}
				let pageInfo = [];
				if (typeof __JAVASCRIPT_EMETTEUR !== 'undefined') {
					pageInfo.push(`Emetteur=${__JAVASCRIPT_EMETTEUR}`);
				}
				if (typeof __JAVASCRIPT_TYPE_CLIENT !== 'undefined') {
					pageInfo.push(`TypeClient=${__JAVASCRIPT_TYPE_CLIENT}`);
				}
				pageInfo.push(`${Share.origin_name}=${Share.origin_value}`);
				content.innerHTML = pageInfo.join("<br/>");
				content.innerHTML += '<hr>';
				content.innerHTML += favorite;

			}
			//console.log(Share);
			// document.f.addEventListener("submit", function(e) {
			// 	// e.preventDefault();
			// 	alert('hello injection');
			// 	return false;
			// });
		}


		let script = document.createElement('script');
		script.appendChild(document.createTextNode('('+ injection.toString().replace('__Share__', JSON.stringify(Share)) +')();'));
		(document.body || document.head || document.documentElement).appendChild(script);
	// }
})();