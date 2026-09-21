/**
 * ui.js - UI helper functions for modals, dropdowns, notifications
 */

/**
 * Show a modal by removing the 'hidden' class
 */
export const showModal = (modalElement) => {
    if (modalElement) {
        modalElement.classList.remove('hidden');
    }
};

/**
 * Hide a modal by adding the 'hidden' class
 */
export const hideModal = (modalElement) => {
    if (modalElement) {
        modalElement.classList.add('hidden');
    }
};

/**
 * Toggle dropdown visibility
 */
export const toggleDropdown = (dropdownElement, show) => {
    if (!dropdownElement) return;

    if (show === undefined) {
        dropdownElement.classList.toggle('hidden');
    } else if (show) {
        dropdownElement.classList.remove('hidden');
    } else {
        dropdownElement.classList.add('hidden');
    }
};

/**
 * Create a simple toast notification
 */
export const showToast = (message, type = 'info', duration = 3000) => {
    const toast = document.createElement('div');

    const bgColor = {
        success: 'bg-green-600',
        error: 'bg-red-600',
        warning: 'bg-amber-600',
        info: 'bg-cyan-600',
    }[type] || 'bg-slate-600';

    toast.className = `fixed bottom-4 right-4 ${bgColor} text-white px-4 py-2 rounded-lg shadow-lg z-[200] transition-all transform translate-y-0 opacity-100`;
    toast.textContent = message;

    document.body.appendChild(toast);

    setTimeout(() => {
        toast.classList.add('translate-y-2', 'opacity-0');
        setTimeout(() => toast.remove(), 300);
    }, duration);
};

/**
 * Keyboard navigation helper for dropdowns
 */
export class DropdownKeyboardNav {
    constructor(dropdownElement, itemSelector = '[data-dropdown-item]') {
        this.dropdown = dropdownElement;
        this.itemSelector = itemSelector;
        this.activeIndex = -1;
        this.items = [];
    }

    updateItems() {
        this.items = Array.from(
            this.dropdown.querySelectorAll(this.itemSelector)
        );
    }

    navigate(direction) {
        this.updateItems();
        if (this.items.length === 0) return;

        this.activeIndex += direction;
        if (this.activeIndex < 0) this.activeIndex = this.items.length - 1;
        if (this.activeIndex >= this.items.length) this.activeIndex = 0;

        this.highlight();
    }

    highlight() {
        this.items.forEach((item, idx) => {
            if (idx === this.activeIndex) {
                item.classList.add('bg-cyan-600', 'text-white');
                item.scrollIntoView({ block: 'nearest' });
            } else {
                item.classList.remove('bg-cyan-600', 'text-white');
            }
        });
    }

    select() {
        if (this.activeIndex >= 0 && this.activeIndex < this.items.length) {
            this.items[this.activeIndex].click();
        }
    }

    reset() {
        this.activeIndex = -1;
        this.items.forEach((item) => {
            item.classList.remove('bg-cyan-600', 'text-white');
        });
    }
}

/**
 * Debounce function for input handlers
 */
export const debounce = (fn, delay = 300) => {
    let timeoutId;
    return (...args) => {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => fn.apply(this, args), delay);
    };
};

/**
 * Create confirmation dialog
 */
export const confirm = (message) => {
    return window.confirm(message);
};

/**
 * Safe element querySelector with null check
 */
export const $ = (selector, parent = document) => parent.querySelector(selector);

/**
 * Safe element querySelectorAll
 */
export const $$ = (selector, parent = document) => Array.from(parent.querySelectorAll(selector));
