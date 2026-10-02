(() => {
    /** Derive menu visibility from its actions, including after moderator-role changes. */
    function sync(content) {
        if (content._dropdownContainer)
            content._dropdownContainer.style.display = content.childElementCount ? '' : 'none';
        if (!content.childElementCount) content.classList.remove('show');
    }

    /** Omit empty local menus; keep hidden remote shells so later role changes can add actions. */
    function attach(client, bar, container, button, content, preserveForRoleChanges = false) {
        if (!content.childElementCount && !preserveForRoleChanges) {
            content.remove();
            return false;
        }
        container.appendChild(button);
        document.body.appendChild(content);
        button._dropdownContent = content;
        content._dropdownContainer = container;
        sync(content);
        client.handleDropdownEvents(container, button, content);
        bar.appendChild(container);
        return true;
    }

    window.BodrikVideoDropdown = { attach, sync };
})();
