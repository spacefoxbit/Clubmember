# CarMate Design System

A clean, modern design system with blue gradient accents and smooth interactions optimized for both desktop and iOS mobile devices.

## Color Palette

```css
:root {
  --bg-start: #e0f2fe;        /* Light sky blue */
  --bg-end: #f0f9ff;          /* Very light blue */
  --card: #ffffff;            /* White */
  --muted: #64748b;           /* Slate gray for secondary text */
  --accent: #0ea5e9;          /* Bright blue accent */
  --accent-hover: #0284c7;    /* Darker blue on hover */
  --text: #0f172a;            /* Dark slate for primary text */
  --border: #e2e8f0;          /* Light gray borders */
  --success: #10b981;         /* Green for success states */
  --radius: 12px;             /* Standard border radius */
  --shadow: 0 10px 25px rgba(14, 165, 233, 0.12), 0 4px 10px rgba(14, 165, 233, 0.08);
}
```

## Typography

- **Font Family**: 'Inter', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif
- **Headings (H1)**: 32px, bold (700), gradient text effect
- **Labels**: 14px, semi-bold (600), uppercase, 0.5px letter-spacing
- **Body Text**: 16px, normal weight
- **Hint Text**: 15px, muted color
- **Small Text**: 13-14px for secondary information

## Layout

### Container Pattern
```css
.container {
  width: 100%;
  max-width: 920px;
  margin: 0 auto;
}
```

### Card Pattern
```css
.card {
  background: var(--card);
  border-radius: var(--radius);
  padding: 40px;
  box-shadow: var(--shadow);
  border: 1px solid var(--border);
}
```

### Body Setup (iOS-friendly)
```css
body {
  margin: 0;
  font-family: 'Inter', system-ui, -apple-system, sans-serif;
  background: linear-gradient(135deg, var(--bg-start) 0%, var(--bg-end) 100%);
  background-attachment: fixed;
  color: var(--text);
  padding: 20px;
  min-height: 100vh;
}
```

## Components

### Buttons
```css
button {
  background: linear-gradient(135deg, var(--accent) 0%, var(--accent-hover) 100%);
  color: white;
  border: none;
  padding: 14px 28px;
  border-radius: 10px;
  cursor: pointer;
  font-weight: 600;
  font-size: 15px;
  transition: all 0.2s ease;
  box-shadow: 0 4px 12px rgba(14, 165, 233, 0.3);
}

button:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(14, 165, 233, 0.4);
}
```

### Input Fields
```css
input[type=number],
.car-select {
  width: 100%;
  padding: 14px 16px;
  border-radius: 10px;
  border: 2px solid var(--border);
  font-size: 16px;
  transition: all 0.2s ease;
  font-family: inherit;
}

input:focus {
  outline: none;
  border-color: var(--accent);
  box-shadow: 0 0 0 3px rgba(14, 165, 233, 0.1);
}
```

### Radio Buttons / Toggles
```css
.radio-label {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  padding: 8px 12px;
  border-radius: 8px;
  border: 2px solid var(--border);
  transition: all 0.2s ease;
  background: white;
  font-size: 14px;
  font-weight: 500;
}

.radio-label:hover {
  border-color: var(--accent);
  background: #f0f9ff;
}
```

### Content Cards (Columns)
```css
.cols {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 24px;
  margin-top: 24px;
}

.col {
  background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
  border-radius: 10px;
  padding: 20px;
  border: 1px solid var(--border);
}

.col h3 {
  margin: 0 0 14px;
  font-size: 16px;
  font-weight: 700;
  color: var(--text);
  text-transform: capitalize;
  display: flex;
  align-items: center;
  gap: 8px;
}

.col h3::before {
  content: '';
  width: 4px;
  height: 20px;
  background: var(--accent);
  border-radius: 2px;
}
```

## Timeline Component

### Structure
```html
<div class="timeline-container">
  <div class="timeline-item">
    <div class="timeline-dot"></div>
    <div class="timeline-content right">
      <div class="timeline-label">Label</div>
      <div class="timeline-value">Value</div>
    </div>
  </div>
  
  <div class="timeline-scale">
    <div class="timeline-line"></div>
    <div class="timeline-current" id="timelineCurrent">
      <div class="timeline-content left">
        <div class="timeline-label">Current</div>
        <div class="timeline-value">Value</div>
      </div>
      <div class="timeline-dot breathing"></div>
    </div>
  </div>
  
  <div class="timeline-item highlight">
    <div class="timeline-dot"></div>
    <div class="timeline-content right">
      <div class="timeline-label">Next</div>
      <div class="timeline-value">Value</div>
    </div>
  </div>
</div>
```

### Styling
- 3-column grid layout: Left content | Center dot | Right content
- Vertical line connects all dots
- Current position has breathing animation (red)
- Highlighted items use accent color (blue)
- Dynamic positioning via `top` property on `.timeline-current`

## Animations

### Fade In
```css
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(-10px) }
  to { opacity: 1; transform: translateY(0) }
}
```

### Slide Down
```css
@keyframes slideDown {
  from { opacity: 0; transform: translateY(-10px) }
  to { opacity: 1; transform: translateY(0) }
}
```

### Breathing (Pulsing)
```css
@keyframes breathing {
  0%, 100% {
    transform: scale(1);
    box-shadow: 0 0 0 4px rgba(239, 68, 68, 0.2);
  }
  50% {
    transform: scale(1.15);
    box-shadow: 0 0 0 8px rgba(239, 68, 68, 0.3);
  }
}
```

## Brand Colors for Integrations

### Google Calendar
```css
.google-calendar {
  background: #4285f4;
  box-shadow: 0 4px 12px rgba(66, 133, 244, 0.3);
}
```

### Apple Calendar
```css
.apple-calendar {
  background: #000000;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
}
```

## Responsive Design

```css
@media (max-width: 640px) {
  .card { padding: 24px; }
  h1 { font-size: 24px; }
  .cols { grid-template-columns: 1fr; }
  .input-row { flex-direction: column; }
  button { width: 100%; }
}
```

## iOS-Specific Considerations

1. **No Flexbox Centering on Body**: Causes scroll lock
   - Use `margin: 0 auto` on containers instead
   
2. **Touch Events**: Add both `click` and `touchend` event listeners
   ```javascript
   element.addEventListener('click', handler);
   element.addEventListener('touchend', handler);
   ```

3. **Background**: Use `background-attachment: fixed` for smooth scrolling

4. **Overflow**: Set `overflow-x: hidden` on html/body to prevent horizontal scroll

## Key Design Principles

1. **Consistent Spacing**: 8px base unit (8, 12, 16, 20, 24, 32, 40px)
2. **Soft Shadows**: Use rgba with low opacity (0.1-0.3)
3. **Smooth Transitions**: 0.2-0.3s ease for most interactions
4. **Blue Gradient Theme**: Light blue backgrounds, bright blue accents
5. **Rounded Corners**: 10-12px standard radius
6. **Clear Visual Hierarchy**: Labels uppercase/small, values larger/bold
7. **Interactive Feedback**: Hover states with transform and shadow changes
8. **Mobile-First**: Ensure iOS Safari compatibility
