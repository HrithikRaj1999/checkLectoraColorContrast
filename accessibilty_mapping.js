const accessibilityRuleDescriptions = {
  "color-contrast": {
    help: `Ensure that the text color has sufficient contrast against the background color`,
  },
  "image-alt": {
    help: `Add meaningful \`alt\` attributes to all \`<img>\` tags.`,
  },
  label: {
    help: `Provide \`<label>\` elements for form controls and ensure that buttons have descriptive text.`,
  },
  "heading-order": {
    help: `Use headings (\`<h1>\` to \`<h6>\`) in a sequential and logical order. Start with \`<h1>\` for the main title of the page, followed by \`<h2>\`, \`<h3>\`, etc., to represent subheadings. Avoid skipping heading levels (e.g., jumping from \`<h1>\` to \`<h3>\`) to maintain a clear and logical content structure.`,
  },
  "landmark-one-main": {
    description: `The page lacks a main landmark, which helps screen readers of assistive technologies to quickly navigate to the primary content of the page. Without a \`<main>\` element, screen readers may have to navigate through a lot of irrelevant content before finding the main information.
  
  Incorrect example: 
  <div>
    <h1>Main Content</h1>
  </div>
  
  Correct example:
  <main>
    <h1>Main Content</h1>
  </main>`,
    help: `Include a \`<main>\` element to designate the main content area of the page. The \`<main>\` element should be used only once per page and should contain the primary content of the document, excluding repeated content like headers, footers, or navigation bars. This assists screen readers in identifying where the primary information is located.`,
  },
  "page-has-heading-one": {
    description: `The page does not include a top-level heading (\`<h1>\`), making it unclear what the main topic or purpose of the page is. The \`<h1>\` element is crucial as it serves as the primary title of the page, helping screen readers quickly understand the main content.
  
  Incorrect example: 
  <div>
    <h2>Subsection Title</h2>
  </div>
  
  Correct example:
  <div>
    <h1>Main Title</h1>
    <h2>Subsection Title</h2>
  </div>`,
    help: `Add an \`<h1>\` element at the beginning of the content to provide a clear and concise title. This helps screen readers understand the primary focus of the page, especially for screen reader screen readers who may rely on the \`<h1>\` to understand the structure and purpose of the page. There should be only one \`<h1>\` per page.`,
  },
  region: {
    description: `Certain parts of the page are not properly sectioned, which can confuse screen readers relying on assistive technologies to navigate content. Without clear regions, screen readers might struggle to understand the structure and flow of the content.
  
  Incorrect example: 
  <div>
    <p>This is some text.</p>
  </div>
  
  Correct example:
  <section>
    <p>This is some text in a section.</p>
  </section>`,
    help: `Use semantic elements like \`<section>\`, \`<article>\`, \`<nav>\`, and \`<aside>\` to organize content into meaningful regions. This enhances navigation and comprehension for all screen readers, particularly those using screen readers. Clear regions help screen readers skip to relevant sections and understand the context of each part of the page.`,
  },
  "aria-hidden-focus": {
    description: `Elements that are visually hidden using \`aria-hidden="true"\` are still focusable, causing confusion for keyboard and screen reader screen readers. Focusable hidden elements can disrupt the navigation flow and lead to a confusing user experience.
  
  Incorrect example: 
  <div aria-hidden="true">
    <button>Hidden Button</button>
  </div>
  
  Correct example:
  <div aria-hidden="true" tabindex="-1">
    <button disabled>Hidden Button</button>
  </div>`,
    help: `Ensure that hidden elements are not focusable by adding \`tabindex="-1"\` or removing interactive elements like buttons from the tab order. This prevents screen readers from interacting with hidden content, which should not be accessible or interactive when hidden.`,
  },
  "aria-roles": {
    description: `Interactive or significant elements do not have appropriate ARIA roles, making it difficult for assistive technologies to convey their purpose to screen readers. Without proper roles, screen readers may not understand what an element is supposed to do, leading to confusion and misinterpretation.
  
  Incorrect example: 
  <div>Click me!</div>
  
  Correct example:
  <button role="button">Click me!</button>`,
    help: `Assign relevant ARIA roles (e.g., \`role="button"\`, \`role="navigation"\`) to elements to define their purpose and improve accessibility. This ensures that assistive technologies can correctly interpret and announce these elements, allowing screen readers to interact with them as intended.`,
  },
  tabindex: {
    description: `The tab order of interactive elements is inconsistent or illogical, making keyboard navigation confusing and frustrating for screen readers. An incorrect tab order can cause screen readers to lose context, miss important information, or become stuck in a loop.
  
  Incorrect example: 
  <div tabindex="3">First</div>
  <div tabindex="1">Second</div>
  <div tabindex="2">Third</div>
  
  Correct example:
  <div tabindex="1">First</div>
  <div tabindex="2">Second</div>
  <div tabindex="3">Third</div>`,
    help: `Arrange the \`tabindex\` values in a logical sequence that follows the visual flow of the page. This ensures that screen readers can navigate through elements in an intuitive order using the keyboard, without unexpected jumps or skips. Typically, \`tabindex\` values should increase sequentially as the user moves through the page.`,
  },
};

module.exports = accessibilityRuleDescriptions;
