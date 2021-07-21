'use strict';
class Helper {
	constructor() {
		//
	}
	static showPopoverOn(element) {
		let popover = document.createElement('div');
		// let elementPosition = this.getDocumentOffsetPosition(element);
		let elementRect = element.getBoundingClientRect();
		popover.style.left = parseInt(elementRect.left)+'px';
		// popover.style.left = parseInt(elementPosition.left)+'px';
		// popover.style.top = parseInt(elementPosition.top + elementRect.height)+'px';
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
		// setTimeout(() => popover.remove(), 5000);//self destroy
	}
	static getOrigine() {
		let pageOrigine = document.querySelector("[name=page_origine]");
		let formOrigine = document.querySelector("[name=form_origine]");
		let formPageOrigine = document.querySelector("[name=form_page_origine]");
		let result = [];
		[formOrigine, pageOrigine, formPageOrigine].forEach((element, idx) => {
			if (element) {
				result = [element.name, element.value];
			}
		});
		return result;
	}
	static isBankx() {
		return (window.location.pathname.indexOf('/www.exabanque.net/') !== -1);
	}
	static isExacom() {
		return (window.location.pathname.indexOf('/exacom.exalog.net/') !== -1);
	}
	static getSize(size) {
		return parseInt(size.replace(/[^\d\.\-]/g, ''));
	}
	static getUnit(size) {
		return parseInt(size.replace(/[^a-z%]/g, ''));
	}
}

class Draggable {
	static STATE_EXPAND = 1;
	static STATE_COLLAPSE = 2;
	el = null;
	header = null;
	body = null;
	dragging = false;
	toColExp = null;// Collapse & expand Timeout
	pin = false;
	status = Draggable.STATE_COLLAPSE;
	constructor(id) {
		this.id = id;
		this.el = document.createElement('div');
		this.header = document.createElement('header');
		this.body = document.createElement('section');
		this.el.id = id;
		this.el.style.position = 'absolute';
		this.el.style.top = this.lastTop + 'px';
		this.el.className = 'draggable';
		this.header.className = 'draggable-header';
		this.body.className = 'draggable-body';
		// this.header.innerHTML = 'Header';
		// this.body.innerHTML = this.lastTop;
		//action
		// this.status = Draggable.STATE_COLLAPSE;
		this.btnColExp = document.createElement("span");
		this.btnColExp.className = 'header-button';
		this.btnColExp.innerHTML = (this.status == Draggable.STATE_COLLAPSE ? "&gg;" : "&ll;");
		this.btnColExp.addEventListener("click", e => {
			if (this.status == Draggable.STATE_COLLAPSE) {
				this.expand();
			} else {
				this.collapse();
			}
		});
		this.btnPin = document.createElement("span");
		this.btnPin.className = 'header-button';
		this.btnPin.innerHTML = "Pin";
		this.btnPin.addEventListener("click", e => {
			this.pin = !this.pin;
		});
		this.header.appendChild(this.btnColExp);
		this.header.appendChild(this.btnPin);

	}

	get lastTop() {
		return Number(sessionStorage.getItem(`${this.id}_top`) ?? 18);
	}
	set lastTop(lastTop) {
		sessionStorage.setItem(`${this.id}_top`, lastTop);
	}

	#onDragBegin(e) {
		e = e || window.event;
		e.preventDefault();
		this.dragging = true;
		this.el.style.removeProperty('transition');
		this.pos3 = e.clientX;
		this.pos4 = e.clientY;
		document.addEventListener('mouseup', this);
		document.addEventListener('mousemove', this);
	}

	#onDragging(e) {
		e = e || window.event;
		e.preventDefault();
		this.pos1 = this.pos3 - e.clientX;
		this.pos2 = this.pos4 - e.clientY;
		this.pos3 = e.clientX;
		this.pos4 = e.clientY;
		this.el.style.top = (this.el.offsetTop - this.pos2) + "px";
		this.el.style.left = (this.el.offsetLeft - this.pos1) + "px";
	}

	#onDragEnd(e) {
		this.dragging = false;
		this.lastTop = this.el.getBoundingClientRect().top;
		clearTimeout(this.toColExp);
		this.toColExp = setTimeout(() => {
			let left = Helper.getSize(this.el.style.left);
			if (left > 0) {
				this.expand(true);
				this.toColExp = setTimeout(this.collapse.bind(this), 3000);
			} else if (left < 0) {
				this.collapse(true);
			} else {
				this.el.style.removeProperty('transition');
			}
		}, 3000);
	}

	expand(force = false) {//console.log('expand', this.status, Draggable.STATE_COLLAPSE);
		if (this.status == Draggable.STATE_COLLAPSE || force) {
			this.el.style.transition = "left .2s ease-in-out";
			this.el.style.left = 0;
			this.btnColExp.innerHTML = "&ll;";
			this.status = Draggable.STATE_EXPAND;
		}
	}
	collapse(force = false) {//console.log('collapse', this.status, Draggable.STATE_COLLAPSE);
		if (this.status == Draggable.STATE_EXPAND || force) {
			this.el.style.transition = "left .2s ease-in-out";
			this.el.style.left = `-${this.el.offsetWidth - this.btnColExp.offsetWidth}px`;
			this.btnColExp.innerHTML = "&gg;";
			this.status = Draggable.STATE_COLLAPSE;
		}
	}

	setTitle(title) {
		let span = document.createElement('span');
		span.innerHTML = title;
		this.header.appendChild(span);
		return this;
	}

	handleEvent(event) {
		switch(event.type) {
			case "click":
				event.stopPropagation();
				break;
			case "mousedown":
				this.#onDragBegin(event);
				break;
			case 'mousemove':
				if (this.dragging) {
					this.#onDragging(event);
					// this.body.innerHTML = this.lastTop;
				}
				break;
			case 'mouseup':
				this.#onDragEnd(event);
				// this.body.innerHTML = this.lastTop;
				break;
			case 'mouseenter':
				if (Helper.getSize(this.el.style.left) < 0) {
					this.expand();
				}
				break;
			case 'mouseleave':
				if (Helper.getSize(this.el.style.left) == 0) {
					clearTimeout(this.toColExp);
					this.toColExp = setTimeout(this.collapse.bind(this), 3000);
				}
				break;
		}
	}

	getElement() {
		this.el.appendChild(this.header);
		this.el.appendChild(this.body);
		this.header.style.cursor = 'move';
		this.header.addEventListener('mousedown', this);
		this.el.addEventListener("mouseenter", this);
		this.el.addEventListener("mouseleave", this);
		this.el.addEventListener("click", this);
		document.addEventListener("click", this.collapse.bind(this));
		window.addEventListener('scroll', (e) => {
			clearTimeout(this.toColExp);
			this.toColExp = setTimeout(() => {
				this.el.style.transition = "top .5s ease-in-out";
				let top = window.pageYOffset + this.lastTop;
				this.el.style.top = ((top < window.pageYOffset || top >= (window.pageYOffset + window.innerHeight)) ? window.pageYOffset : top) + 'px';
			}, 200);
		});
		return this.el;
	}
}
// let dock1 = new Draggable('dock1');
// document.body.appendChild(dock1.getElement());
// let dock2 = new Draggable('dock2');
// document.body.appendChild(dock2.getElement());

// let JiraHelper = new helper.Jira();
// let time = JiraHelper.parseHumanReadableTime(32460);
// console.log('parsed Time', time);