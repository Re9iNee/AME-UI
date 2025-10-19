import React, {
    useCallback,
    useEffect,
    useMemo,
    useRef,
    useState,
} from 'react';

export interface DropdownOption {
    /**
     * Value that will be returned when the option is selected.
     */
    value: string;
    /**
     * Visible label shown to the user.
     */
    label: string;
    /**
     * Additional text rendered under the label. Optional.
     */
    description?: string;
    /**
     * When true, the option cannot be selected.
     */
    disabled?: boolean;
}

export interface DropdownProps {
    /**
     * Label displayed above the trigger button.
     */
    label?: string;
    /**
     * Options rendered inside the menu.
     */
    options: DropdownOption[];
    /**
     * Placeholder text rendered when no option is selected.
     */
    placeholder?: string;
    /**
     * Optional value that controls the selected option.
     */
    selectedValue?: string;
    /**
     * Fired every time the user selects an option.
     */
    onSelect?: (option: DropdownOption) => void;
    /**
     * Additional class name appended to the root element.
     */
    className?: string;
    /**
     * Accessible label for the menu when an external label is not provided.
     */
    menuAriaLabel?: string;
    /**
     * If true the trigger button will stretch to the width of its container.
     */
    fullWidth?: boolean;
}

const fontStack =
    "'Inter', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif";

const labelStyle: React.CSSProperties = {
    fontSize: '0.875rem',
    fontWeight: 600,
    color: '#1f2937',
};

const menuContainerStyle: React.CSSProperties = {
    position: 'relative',
};

const menuStyle: React.CSSProperties = {
    position: 'absolute',
    zIndex: 10,
    top: '0.2rem',
    left: 0,
    right: 0,
    margin: 0,
    padding: '0.5rem 0',
    listStyle: 'none',
    backgroundColor: '#ffffff',
    borderRadius: '0.5rem',
    border: '1px solid rgba(17, 24, 39, 0.1)',
    boxShadow: '0 12px 32px rgba(15, 23, 42, 0.12)',
    maxHeight: '16rem',
    overflowY: 'auto',
};

const optionDescriptionStyle: React.CSSProperties = {
    fontSize: '0.8rem',
    color: '#6b7280',
};

const getOptionStyle = (
    option: DropdownOption,
    isSelected: boolean,
    isActive: boolean,
): React.CSSProperties => ({
    display: 'flex',
    flexDirection: 'column',
    padding: '0.6rem 0.95rem',
    gap: '0.2rem',
    cursor: option.disabled ? 'not-allowed' : 'pointer',
    fontSize: '0.95rem',
    color: option.disabled ? '#9ca3af' : isSelected ? '#1d4ed8' : '#111827',
    backgroundColor: option.disabled
        ? 'transparent'
        : isSelected
        ? 'rgba(37, 99, 235, 0.12)'
        : isActive
        ? 'rgba(37, 99, 235, 0.08)'
        : 'transparent',
    transition: 'background-color 0.15s ease, color 0.15s ease',
    outline: 'none',
});

export const Dropdown: React.FC<DropdownProps> = ({
    label,
    options,
    placeholder = 'Select an option',
    selectedValue,
    onSelect,
    className,
    menuAriaLabel,
    fullWidth = false,
}) => {
    const [open, setOpen] = useState(false);
    const [internalValue, setInternalValue] = useState<string | undefined>(
        selectedValue,
    );
    const [focusedIndex, setFocusedIndex] = useState<number>(-1);
    const [triggerHovered, setTriggerHovered] = useState(false);
    const [triggerFocused, setTriggerFocused] = useState(false);

    const buttonRef = useRef<HTMLButtonElement>(null);
    const menuRef = useRef<HTMLDivElement>(null);
    const optionRefs = useRef<(HTMLLIElement | null)[]>([]);

    const menuId = useMemo(
        () => `ame-dropdown-${Math.random().toString(36).slice(2)}`,
        [],
    );
    const labelId = useMemo(
        () => (label ? `${menuId}-label` : undefined),
        [label, menuId],
    );

    useEffect(() => {
        if (selectedValue !== undefined) {
            setInternalValue(selectedValue);
        }
    }, [selectedValue]);

    useEffect(() => {
        if (!open) {
            setFocusedIndex(-1);
            return;
        }

        const firstEnabled = options.findIndex((option) => !option.disabled);
        setFocusedIndex(firstEnabled);
    }, [open, options]);

    useEffect(() => {
        if (!open) {
            return undefined;
        }

        const handleClickOutside = (event: MouseEvent) => {
            if (
                menuRef.current &&
                !menuRef.current.contains(event.target as Node) &&
                buttonRef.current &&
                !buttonRef.current.contains(event.target as Node)
            ) {
                setOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [open]);

    useEffect(() => {
        if (!open) {
            return;
        }

        if (focusedIndex < 0) {
            return;
        }

        const node = optionRefs.current[focusedIndex];
        node?.focus();
    }, [open, focusedIndex]);

    const selectedOption = useMemo(() => {
        const value = selectedValue ?? internalValue;
        return options.find((option) => option.value === value);
    }, [selectedValue, internalValue, options]);

    const selectOption = useCallback(
        (option: DropdownOption) => {
            if (option.disabled) {
                return;
            }

            if (selectedValue === undefined) {
                setInternalValue(option.value);
            }

            onSelect?.(option);
            setOpen(false);
            buttonRef.current?.focus();
        },
        [onSelect, selectedValue],
    );

    const focusNext = useCallback(
        (direction: 1 | -1) => {
            if (!options.length) {
                return;
            }

            let nextIndex = focusedIndex;
            for (let i = 0; i < options.length; i += 1) {
                nextIndex = (nextIndex + direction + options.length) % options.length;
                if (!options[nextIndex].disabled) {
                    setFocusedIndex(nextIndex);
                    break;
                }
            }
        },
        [focusedIndex, options],
    );

    const closeMenu = useCallback(() => {
        if (open) {
            setOpen(false);
            buttonRef.current?.focus();
        }
    }, [open]);

    const handleTriggerKeyDown = useCallback(
        (event: React.KeyboardEvent<HTMLButtonElement>) => {
            switch (event.key) {
                case 'ArrowDown':
                case 'Enter':
                case ' ': {
                    event.preventDefault();
                    setOpen(true);
                    break;
                }
                default:
                    break;
            }
        },
        [],
    );

    const handleMenuKeyDown = useCallback(
        (event: React.KeyboardEvent<HTMLUListElement>) => {
            switch (event.key) {
                case 'ArrowDown':
                    event.preventDefault();
                    focusNext(1);
                    break;
                case 'ArrowUp':
                    event.preventDefault();
                    focusNext(-1);
                    break;
                case 'Home':
                    event.preventDefault();
                    setFocusedIndex(() => {
                        const firstEnabled = options.findIndex((option) => !option.disabled);
                        return firstEnabled === -1 ? -1 : firstEnabled;
                    });
                    break;
                case 'End':
                    event.preventDefault();
                    setFocusedIndex(() => {
                        for (let i = options.length - 1; i >= 0; i -= 1) {
                            if (!options[i].disabled) {
                                return i;
                            }
                        }
                        return -1;
                    });
                    break;
                case 'Enter':
                case ' ': {
                    event.preventDefault();
                    const option = options[focusedIndex];
                    if (option && !option.disabled) {
                        selectOption(option);
                    }
                    break;
                }
                case 'Escape':
                    event.preventDefault();
                    closeMenu();
                    break;
                case 'Tab':
                    closeMenu();
                    break;
                default:
                    break;
            }
        },
        [focusNext, focusedIndex, options, selectOption, closeMenu],
    );

    const rootStyle = useMemo<React.CSSProperties>(
        () => ({
            position: 'relative',
            display: 'inline-flex',
            flexDirection: 'column',
            gap: '0.5rem',
            fontFamily: fontStack,
            minWidth: '12rem',
            width: fullWidth ? '100%' : undefined,
        }),
        [fullWidth],
    );

    const triggerStyle = useMemo<React.CSSProperties>(
        () => ({
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            width: '100%',
            padding: '0.625rem 0.75rem',
            borderRadius: '0.5rem',
            border: `1px solid ${
                triggerFocused || triggerHovered ? '#2563eb' : '#d1d5db'
            }`,
            backgroundColor: '#ffffff',
            color: '#111827',
            fontSize: '0.95rem',
            lineHeight: '1.25rem',
            cursor: 'pointer',
            transition:
                'box-shadow 0.2s ease, border-color 0.2s ease, background-color 0.2s ease',
            boxShadow: triggerFocused ? '0 0 0 3px rgba(37, 99, 235, 0.2)' : undefined,
            outline: 'none',
        }),
        [triggerFocused, triggerHovered],
    );

    const triggerTextStyle = useMemo<React.CSSProperties>(
        () => ({
            flex: 1,
            textAlign: 'left',
            color: selectedOption ? '#111827' : '#6b7280',
        }),
        [selectedOption],
    );

    const iconStyle = useMemo<React.CSSProperties>(
        () => ({
            marginLeft: '0.5rem',
            fontSize: '0.85rem',
            color: '#6b7280',
            transition: 'transform 0.2s ease',
            transform: open ? 'rotate(-180deg)' : undefined,
        }),
        [open],
    );

    return (
        <div
            className={className}
            style={rootStyle}
            data-state={open ? 'open' : 'closed'}
        >
            {label && (
                <label id={labelId} style={labelStyle}>
                    {label}
                </label>
            )}
            <button
                type="button"
                style={triggerStyle}
                aria-haspopup="listbox"
                aria-expanded={open}
                aria-controls={menuId}
                aria-labelledby={label ? `${labelId} ${menuId}-trigger` : `${menuId}-trigger`}
                onClick={() => setOpen((value) => !value)}
                onKeyDown={handleTriggerKeyDown}
                onMouseEnter={() => setTriggerHovered(true)}
                onMouseLeave={() => setTriggerHovered(false)}
                onFocus={() => setTriggerFocused(true)}
                onBlur={() => setTriggerFocused(false)}
                ref={buttonRef}
            >
                <span id={`${menuId}-trigger`} style={triggerTextStyle}>
                    {selectedOption ? selectedOption.label : placeholder}
                </span>
                <span style={iconStyle} aria-hidden="true">
                    ▾
                </span>
            </button>
            <div ref={menuRef} style={menuContainerStyle} role="presentation">
                {open && (
                    <ul
                        style={menuStyle}
                        id={menuId}
                        role="listbox"
                        aria-labelledby={labelId}
                        aria-label={label ? undefined : menuAriaLabel}
                        onKeyDown={handleMenuKeyDown}
                    >
                        {options.map((option, index) => {
                            const isSelected = selectedOption?.value === option.value;
                            const isActive = index === focusedIndex;
                            return (
                                <li
                                    key={option.value}
                                    role="option"
                                    aria-selected={isSelected}
                                    aria-disabled={option.disabled}
                                    style={getOptionStyle(option, isSelected, isActive)}
                                    tabIndex={-1}
                                    ref={(node) => {
                                        optionRefs.current[index] = node;
                                    }}
                                    onMouseEnter={() => {
                                        if (!option.disabled) {
                                            setFocusedIndex(index);
                                        }
                                    }}
                                    onMouseDown={(event) => event.preventDefault()}
                                    onClick={() => selectOption(option)}
                                >
                                    <span>{option.label}</span>
                                    {option.description && (
                                        <span style={optionDescriptionStyle}>
                                            {option.description}
                                        </span>
                                    )}
                                </li>
                            );
                        })}
                    </ul>
                )}
            </div>
        </div>
    );
};

export default Dropdown;
