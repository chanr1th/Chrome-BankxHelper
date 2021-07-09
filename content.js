'use strict';
(() => {
	if (location.pathname.startsWith('/www.exabanque.net/site_ct/')) {
		///////TEST////////
		
		///////////////////
		let Share = {};
		// toggle switch
		var appEnable = true;
		chrome.storage.sync.get('appEnable', function(data) {
			appEnable = data.appEnable;
		});
		appEnable = appEnable && Helper.isBankx();
		if (appEnable) {
			// const FILE_NAME = window.location.pathname.substring(window.location.pathname.lastIndexOf('/')+1);
			const [ORGINE_FORM_NAME, ORGINE] = Helper.getOrigine();
			Share = {
				'dockId' : 'dock',
				'origin_name' :  ORGINE_FORM_NAME,
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
							'lmeng'
						];
						let found = ulist.find(n => e.target.value.startsWith(n.substring(0, 2)));
						if (found) e.target.value = found; else return;
						password.value='111111';
						document.getElementById("form_valider").click();
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
			} else if(ORGINE=='multiple_sessions_confirmer') {
				let userSession = document.getElementById("form_confirmation_bouton_annuler");
				if (userSession) userSession.click(); 
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

			//////////Docker//////////
			// let docker = new Docker();
			// docker.id = Share.dockId;
			// document.body.appendChild(docker.getElement());
			// // Custome Information
			const STATE_EXPEND = 1;
			const STATE_COLLAPSE = 2;
			//TODO: stick left or right
			let stickTo = "left";
			var docker = null;

			// Docker
			docker = document.createElement("div");
			let header = document.createElement("div");
			let hAction = document.createElement("div");
			let content = document.createElement("div");
			docker.id = Share.dockId;
			docker.style.top = (sessionStorage.getItem('dock_top') ?? 18) + 'px';
			docker.addEventListener("click", (e) => e.stopPropagation());
			docker.addEventListener("mouseenter", function() {
				if (getSize(docker.style.left) < 0) {
					dock_expend();
				}
			});
			docker.addEventListener("mouseleave", function(e) {
				if (getSize(docker.style.left) == 0) {
					clearTimeout(window.toColEx);
					window.toColEx = setTimeout(dock_collapse, 3000);
				}
			});
			sessionStorage.setItem('dock_status', sessionStorage.getItem('dock_status') ?? STATE_COLLAPSE);
			// Header
			header.id = docker.id + "-header";
			header.innerHTML = "Information";
			header.style.textAlign = (stickTo == "left" ? "left" : "right");
			hAction.id = "_colexp";
			hAction.innerHTML = (sessionStorage.getItem('dock_status') == STATE_COLLAPSE ? "&gg;" : "&ll;");
			hAction.style.float = (stickTo == "left" ? "right" : "left");
			hAction.addEventListener("click", function() {
				docker.style.transition = "left .2s ease-in-out";
				if (sessionStorage.getItem('dock_status') == STATE_COLLAPSE) {
					dock_expend();
				} else {
					dock_collapse();
				}
			});
			header.appendChild(hAction);
			// Content
			content.id = docker.id + "-content";
			// Attach
			docker.appendChild(header);
			docker.appendChild(content);
			document.body.appendChild(docker);


			let dock_lastTop = docker.getBoundingClientRect().top;
			dragElement(docker);
			document.addEventListener("click", dock_collapse);
			window.addEventListener('scroll', function(e) {
				clearTimeout(window.toColEx);
				window.toColEx = setTimeout(function () {
					docker.style.transition = "top .5s ease-in-out";
					let top = window.pageYOffset + dock_lastTop;
					docker.style.top = ((top<window.pageYOffset||top>=(window.pageYOffset+window.innerHeight))?window.pageYOffset:top) + 'px';
				}, 200);
			});
			setTimeout(function() { // avoid conflict with appendChild()
				docker.style.left = (sessionStorage.getItem('dock_status') == STATE_COLLAPSE ? `-${docker.offsetWidth - hAction.offsetWidth}px` : 0);
			}, 0);
			function dock_expend(force = false) {
				if (sessionStorage.getItem('dock_status') == STATE_COLLAPSE || force) {
					docker.style.transition = "left .2s ease-in-out";
					docker.style.left = 0;
					hAction.innerHTML = "&ll;";
					sessionStorage.setItem('dock_status', STATE_EXPEND);
				}
			}
			function dock_collapse(force = false) {
				if (sessionStorage.getItem('dock_status') == STATE_EXPEND || force) {
					docker.style.transition = "left .2s ease-in-out";
					docker.style.left = `-${docker.offsetWidth - hAction.offsetWidth}px`;
					hAction.innerHTML = "&gg;";
					sessionStorage.setItem('dock_status', STATE_COLLAPSE);
				}
			}
			function getSize(size) {
				return parseInt(size.replace(/[^\d\.\-]/g, ''));
			}
			function getUnit(size) {
				return parseInt(size.replace(/[^a-z%]/g, ''));
			}
			function dragElement(elmnt) {
				var pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;
				if (document.getElementById(elmnt.id + "-header")) {
					/* if present, the header is where you move the DIV from:*/
					document.getElementById(elmnt.id + "-header").onmousedown = dragMouseDown;
				} else {
					/* otherwise, move the DIV from anywhere inside the DIV:*/
					elmnt.onmousedown = dragMouseDown;
				}
				function dragMouseDown(e) {
					elmnt.style.removeProperty('transition');
					e = e || window.event;
					e.preventDefault();
					// get the mouse cursor position at startup:
					pos3 = e.clientX;
					pos4 = e.clientY;
					document.onmouseup = closeDragElement;
					document.onmousemove = elementDrag;
				}
				function elementDrag(e) {
					// clearTimeout(window.toColEx);
					e = e || window.event;
					e.preventDefault();
					// calculate the new cursor position:
					pos1 = pos3 - e.clientX;
					pos2 = pos4 - e.clientY;
					pos3 = e.clientX;
					pos4 = e.clientY;
					elmnt.style.top = (elmnt.offsetTop - pos2) + "px";
					elmnt.style.left = (elmnt.offsetLeft - pos1) + "px";
				}
				function closeDragElement() {
					/* stop moving when mouse button is released:*/
					document.onmouseup = null;
					document.onmousemove = null;
					dock_lastTop = docker.getBoundingClientRect().top;
					sessionStorage.setItem('dock_top', dock_lastTop);
					clearTimeout(window.toColEx);
					window.toColEx = setTimeout(function() {
						let left = getSize(elmnt.style.left);
						if (left > 0) {
							dock_expend(true);
							window.toColEx = setTimeout(dock_collapse, 3000);
						} else if (left < 0) {
							dock_collapse(true);
						} else {
							elmnt.style.removeProperty('transition');
						}
					}, 3000);
				}
			}
		}
		// chrome.storage.sync.get('showDock', function(data) {
		// 	let displayStyle = data.showDock ? 'inherit' : 'none';
		// 	docker.style.display = displayStyle;
		// });
		chrome.storage.sync.get(null, function(items) {
			for (let key in items) {
				let val = items[key];
				switch(key) {
					case 'showDock':
						if (docker) {
							docker.style.display = (appEnable && val) ? 'inherit' : 'none';
							// console.log('display = ',appEnable);
						}
						break;
					case 'darkMode':
						(appEnable && val) ? document.body.classList.add('dark-mode') : document.body.classList.remove('dark-mode');
						break;
					case 'appEnable':
						if (val) {
							chrome.storage.sync.get('showDock', function(data) {
								if (docker) {
									docker.style.display = data.showDock ? 'inherit' : 'none';
								}
							});
							chrome.storage.sync.get('darkMode', function(data) {
								data.darkMode ? document.body.classList.add('dark-mode') : document.body.classList.remove('dark-mode');
							});
						} else {
							if (docker) {
								docker.style.display = 'none';
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
						docker.style.display = (appEnable && newValue) ? 'inherit' : 'none';
						console.log('change display = ',appEnable);
						break;
					case 'darkMode':
						(appEnable && newValue) ? document.body.classList.add('dark-mode') : document.body.classList.remove('dark-mode');
						break;
					case 'appEnable':
						if (newValue) {
							chrome.storage.sync.get('showDock', function(data) {
								docker.style.display = data.showDock ? 'inherit' : 'none';
							});
							chrome.storage.sync.get('darkMode', function(data) {
								data.darkMode ? document.body.classList.add('dark-mode') : document.body.classList.remove('dark-mode');
							});
						} else {
							docker.style.display = 'none';
							document.body.classList.remove('dark-mode');
						}
						break;
				}
				//console.log('Storage key "%s" in namespace "%s" changed. Old value was "%s", new value is "%s".', key, namespace, changes[key].oldValue, changes[key].newValue);
			}
		});
		// let jiraHelper = new helper.Jira();
		// let minute = jiraHelper.humanReadableTimeToMinute('1h 1m');
		// console.log(minute);
		// inject to conent
		function injection() {
			console.log('Bankx-helper : Content script injected.');
			let Share = JSON.parse('__Share__');
			let docker = document.getElementById(Share.dockId);
			if (docker) {
				let content = document.getElementById(Share.dockId + '-content');
				let favList = Array.from(document.querySelectorAll(".fav-star.active+a"));
				let favorite = '';
				if (favList.length > 0) {
					favorite += '<hr><ul style="margin-left:18px">';
					favList.forEach(el => {
						favorite += `<li>${el.outerHTML}</li>`;
					});
					favorite += '</ul>';
				}
				let emetteur = typeof(__JAVASCRIPT_EMETTEUR) === 'undefined' ? '' : __JAVASCRIPT_EMETTEUR;
				let type_client = typeof(__JAVASCRIPT_TYPE_CLIENT) === 'undefined' ? '' : __JAVASCRIPT_TYPE_CLIENT;
				content.innerHTML = `Emetteur=${emetteur}<br>TypeClient=${type_client},<br> ${Share.origin_name}=${Share.origin_value}`;
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
	}
})();