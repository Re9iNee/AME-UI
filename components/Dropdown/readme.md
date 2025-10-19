# Dropdown

A composable dropdown menu with keyboard navigation, optional descriptions, and a fully accessible structure.

## Usage

```tsx
import { Dropdown } from '../Dropdown';

const items = [
    { value: 'design', label: 'Product Design', description: 'Work with our design system' },
    { value: 'frontend', label: 'Front-end Engineering' },
    { value: 'qa', label: 'Quality Assurance', disabled: true },
];

export function Example() {
    return (
        <Dropdown
            label="Team"
            placeholder="Select a team"
            options={items}
            onSelect={(option) => console.log(option.value)}
        />
    );
}
```

## Styling

The component uses inline CSS-in-JS styles by default. You can still provide a
`className` to supply additional styling hooks when integrating the dropdown in
your project.
