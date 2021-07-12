'use strict';
class Helper {
	constructor() {
		//
	}
	static showPopoverOn(element) {
		let popover = document.createElement('div');
		popover.style.left = parseInt(10 + element.getBoundingClientRect().left)+'px';
		popover.className = 'popover';
		let body = document.createElement('div');
		body.className = 'popover-body';
		body.innerHTML = `name : ${element.name}<br>onClick : ${element.getAttribute('onclick')}`;
		let close = document.createElement('span');
		close.className = 'popover-close';
		close.innerHTML = '&times;';
		close.addEventListener('click', () => popover.remove());
		popover.appendChild(body);
		popover.appendChild(close);
		// element.parentNode.insertBefore(popover, element.nextSibling);
		element.parentNode.appendChild(popover, element.nextSibling);
		setTimeout(() => popover.remove(), 5000);//self destroy
	}
	static getOrigine() {
		let pageorigine = document.getElementsByName("page_origine");
		let formorigine = document.getElementsByName("form_origine");
		let form_pageorigine = document.getElementsByName("form_page_origine");
		let result = [];
		[formorigine, pageorigine, form_pageorigine].forEach((itm, idx) => {
			if (itm.length) {
				result = [itm[0].name, itm[0].value];
			}
		});
		return result;
	}
	static isBankx() {
		return !!(document.getElementsByName('form_global_id_controle')[0]);
	}
}

class Docker {
	static STATE_EXPEND = 1;
	static STATE_COLLAPSE = 2;
	constructor() {
		this.status = this.STATE_COLLAPSE;
		this.docker = document.createElement("div");
		this.id = 'docker';
		this.ceTimeout = null;//collap and expend Timeout
		this.header = document.createElement("div");
		this.hAction = document.createElement("div");
		this.content = document.createElement("div");
		this.dock_lastTop = 100;
	}
	getElement() {
		this.docker.id = this.id;
		this.docker.style.fontSize = '1rem';
		this.docker.style.top = (sessionStorage.getItem('dock_top') ?? 18) + 'px';
		this.docker.addEventListener("click", (e) => e.stopPropagation());
		this.docker.addEventListener("mouseenter", () => {
			if (this.getSize(this.docker.style.left) < 0) {
				this.dock_expend();
			}
		});
		this.docker.addEventListener("mouseleave", (e) => {
			if (this.getSize(this.docker.style.left) == 0) {
				clearTimeout(this.ceTimeout);
				this.ceTimeout = setTimeout(this.dock_collapse, 3000);
			}
		});
		sessionStorage.setItem('dock_status', sessionStorage.getItem('dock_status') ?? this.STATE_COLLAPSE);
		// Header
		this.header.id = this.docker.id + "-header";
		this.header.innerHTML = "Information";
		// header.style.textAlign = (stickTo == "left" ? "left" : "right");
		this.hAction.id = "_colexp";
		this.hAction.innerHTML = (sessionStorage.getItem('dock_status') == this.STATE_COLLAPSE ? "&gg;" : "&ll;");
		// hAction.style.float = (stickTo == "left" ? "right" : "left");
		this.hAction.addEventListener("click", () => {
			this.docker.style.transition = "left .2s ease-in-out";
			if (sessionStorage.getItem('dock_status') == this.STATE_COLLAPSE) {
				this.dock_expend();
			} else {
				this.dock_collapse();
			}
		});
		this.header.appendChild(this.hAction);
		// Content
		this.content.id = this.docker.id + "-content";
		// Attach
		this.docker.appendChild(this.header);
		this.docker.appendChild(this.content);
		this.dock_lastTop = this.docker.getBoundingClientRect().top;
		this.dragElement(this.docker);
		document.addEventListener("click", this.dock_collapse);
		window.addEventListener('scroll', (e) => {
			clearTimeout(this.ceTimeout);
			this.ceTimeout = setTimeout(() => {
				this.docker.style.transition = "top .5s ease-in-out";
				let top = window.pageYOffset + this.dock_lastTop;
				this.docker.style.top = ((top<window.pageYOffset||top>=(window.pageYOffset+window.innerHeight))?window.pageYOffset:top) + 'px';
			}, 200);
		});
		setTimeout(() => { // avoid conflict with appendChild()
			this.docker.style.left = (sessionStorage.getItem('dock_status') == this.STATE_COLLAPSE ? `-${this.docker.offsetWidth - this.hAction.offsetWidth}px` : 0);
		}, 0);
		return this.docker;
	}
	dock_expend(force = false) {
		if (sessionStorage.getItem('dock_status') == this.STATE_COLLAPSE || force) {
			this.docker.style.transition = "left .2s ease-in-out";
			this.docker.style.left = 0;
			this.hAction.innerHTML = "&ll;";
			sessionStorage.setItem('dock_status', this.STATE_EXPEND);
		}
	}
	dock_collapse(force = false) {
		if (sessionStorage.getItem('dock_status') == this.STATE_EXPEND || force) {
			this.docker.style.transition = "left .2s ease-in-out";
			this.docker.style.left = `-${this.docker.offsetWidth - this.hAction.offsetWidth}px`;
			this.hAction.innerHTML = "&gg;";
			sessionStorage.setItem('dock_status', this.STATE_COLLAPSE);
		}
	}
	getSize(size) {
		return parseInt(size.replace(/[^\d\.\-]/g, ''));
	}
	// getUnit(size) {
	// 	return parseInt(size.replace(/[^a-z%]/g, ''));
	// }
	dragElement(elmnt) {
		var pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;
		let dragMouseDown = (e) => {
			elmnt.style.removeProperty('transition');
			e = e || window.event;
			e.preventDefault();
			// get the mouse cursor position at startup:
			pos3 = e.clientX;
			pos4 = e.clientY;
			document.onmouseup = closeDragElement;
			document.onmousemove = elementDrag;
		}
		let elementDrag = (e) => {
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
		let closeDragElement = () => {
			/* stop moving when mouse button is released:*/
			document.onmouseup = null;
			document.onmousemove = null;
			this.dock_lastTop = this.docker.getBoundingClientRect().top;
			sessionStorage.setItem('dock_top', this.dock_lastTop);
			clearTimeout(this.ceTimeout);
			this.ceTimeout = setTimeout(function() {
				let left = getSize(elmnt.style.left);
				if (left > 0) {
					this.dock_expend(true);
					this.ceTimeout = setTimeout(this.dock_collapse, 3000);
				} else if (left < 0) {
					this.dock_collapse(true);
				} else {
					elmnt.style.removeProperty('transition');
				}
			}, 3000);
		}
		if (document.getElementById(elmnt.id + "-header")) {
			/* if present, the header is where you move the DIV from:*/
			document.getElementById(elmnt.id + "-header").onmousedown = dragMouseDown;
		} else {
			/* otherwise, move the DIV from anywhere inside the DIV:*/
			elmnt.onmousedown = dragMouseDown;
		}
	}
}
// let JiraHelper = new helper.Jira();
// let time = JiraHelper.parseHumanReadableTime(32460);
// console.log('parsed Time', time);