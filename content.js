'use strict';
(() => {
	if (!Helper.isSiteRoot()) {
		///////TEST////////
		
		///////////////////
		class Config {
			constructor() {
				this.appEnable = true;
				this.showDock = true;
				this.darkMode = false;
				this.automation = false;
				this.autoComplete = true;
				this.autoSubmit = false;
			}
			refresh() {
				return new Promise((resolve, reject) => chrome.storage.sync.get(null, data => {
					for (let key in data) {
						this[key] = data[key];
					}
					resolve(data);
				}));
			}
		}
		class App {
			constructor() {
				this.config = new Config();
				[this.formOrigine, this.orgine] = Helper.getOrigine();
				this.share = {
					'dockId' : 'dock',
					'origin_name' : this.formOrigine,
					'origin_value' : this.orgine
				};
				this.draggable = new Draggable(this.share.dockId);
				// const FILE_NAME = window.location.pathname.substring(window.location.pathname.lastIndexOf('/')+1);
			}
			init() {
				chrome.storage.sync.get(null, items => {
					for (let key in items) {
						this.refreshSettings(key, items[key]);
					}
				});
				chrome.storage.onChanged.addListener((changes, namespace) => {
					for (let key in changes) {
						this.refreshSettings(key, changes[key].newValue);
						//console.log('Storage key "%s" in namespace "%s" changed. Old value was "%s", new value is "%s".', key, namespace, changes[key].oldValue, changes[key].newValue);
					}
				});
				return this.config.refresh();
			}
			refreshSettings(key, value) {
				switch(key) {
					case 'showDock':
						this.draggable.toggleDisplay(this.config.appEnable && value);
						break;
					case 'darkMode':
						document.documentElement.classList.toggle('dark-mode', (this.config.appEnable && value));
						break;
					case 'appEnable':
						if (value) {
							chrome.storage.sync.get(null, data => {
								this.draggable.toggleDisplay(data.showDock);
								document.documentElement.classList.toggle('dark-mode', !!data.darkMode);
							});
						} else {
							this.draggable.toggleDisplay(false);
							document.documentElement.classList.remove('dark-mode');
						}
						break;
				}
				this.config[key] = value;
			}
			load() {
				this.addAutomation();
				this.addPopoverHint();
				this.addFloatingDock();
			}
			addAutomation() {
				if (this.config.appEnable && this.config.automation && this.config.autoComplete) {
					// auto fill password in admin
					let mdp = document.querySelector("[name=motdepasse]");
					if (mdp) {
						mdp.value = 'theobald';
					}
					if (this.orgine == 'authent') {
						let username = document.querySelector("[name=form_nom_acces]");
						let password = document.querySelector("[name=form_mot_de_passe]");
						if (username) {
							username.addEventListener('focus', (e) => {
								if (!this.config.appEnable) return;
								e.target.value = '';
							});
							username.addEventListener('input', (e) => {
								if (!this.config.appEnable) return;
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
								let found = null;
								if (e.target.value.length == 2) {
									found = ulist.find(n => e.target.value.startsWith(n.substring(0, 2)));
									if (found) e.target.value = found; else return;
								} else if (this.config.autoSubmit && ulist.indexOf(e.target.value) !== -1) {
									found = e.target.value;
								}
								password.value = '111111';
								if (found && this.config.autoSubmit) {
									let formValider = document.querySelector('[name=form_valider]').click();
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
						if (this.config.autoSubmit) {
							document.getElementById("form_validate_grid").click();
						}
					} else if(this.orgine == 'multiple_sessions_confirmer') {
						let userSession = document.getElementById("form_confirmation_bouton_annuler");
						if (userSession && this.config.autoSubmit) {
							userSession.click();
						}
					} else {
						// nothing
					}
				}
			}
			addPopoverHint() {
				let inputs = document.querySelectorAll('[name]');
				inputs.forEach((element, index) => {
					element.addEventListener('auxclick', (e) => {//not left click (rightClick or mouseWheelClick)
						if (!this.config.appEnable) return;
						if (e.button == 1 || e.button == 4) {//mouse wheel click || mouse ? click
							e.preventDefault();
							e.stopPropagation();
							Helper.showPopoverOn(element);
						}
					});
				});
				var clickedEle = null;
				document.addEventListener("contextmenu", (event) => {
					if (!this.config.appEnable) return;
					clickedEle = event.target;
				}, true);
				chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
					if (!this.config.appEnable) return;
					if (request === "showPopover") {
						Helper.showPopoverOn(clickedEle);
					}
				});
			}
			addFloatingDock() {
				document.body.appendChild(this.draggable.getElement());
				let infoLines = [];
				infoLines.push(`${this.formOrigine}=${this.orgine}`);
				let favList = Array.from(document.querySelectorAll(".fav-star.active+a"));
				let favorite = '<u>Favorite List:</u><br>';
				if (favList.length > 0) {
					favorite += '<ul style="margin-left:18px">';
					favList.forEach(el => {
						favorite += `<li>${el.outerHTML}</li>`;
					});
					favorite += '</ul>';
				}
				infoLines.push(favorite)
				let bodyContent = infoLines.join("<br/>");
				this.draggable
					.setTitle('Information')
					.setBody(bodyContent)
					.show();
				// setTimeout(() => draggable.collapse(true), 0);
				// setTimeout(() => {
				// 	draggableElement.style.left = `-${draggableElement.offsetWidth - draggable.btnColExp.offsetWidth}px`;
				// }, 0);
			}
		}
		//Init
		let app = new App();
		app.init().then(data => app.load());
	}
})();