# Read me

This project will be a learning process to improve my skills with React and some of its libraries, things I'll use/learn:

- State management with Context API, hooks & URL
- React Router
- Github actions for testing
- Tailwind CSS
- Vite
- Working with dates
- Making more use of shortcuts, snippets and extensions with:
  - ESLint
  - Inline fold
  - Inlay hints
  - indent rainbow
  - Prettier
  - Pretty typescript errors
  - SImple react snippets
  - Tailwind CSS Intellisense
  - Template String converter

# Remarks / Thoughts

1. I used the defined Holiday interface throughout my application from the Date holiday library.
   Pros:

- Type safety
- Consistency => The data structure aligns exactly with what the library return, less maintenance

Cons:

- My code is dependent on the library
- Less flexibility (I can't simply add new properties)

I chose to use the exported interface since it fits my needs and I didn't need extra properties.
