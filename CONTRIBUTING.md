# Contributing to Projection Mapper

Thank you for your interest in contributing to Projection Mapper! We welcome contributions from the community to make this tool better for everyone.

## Code of Conduct

By participating in this project, you agree to abide by our Code of Conduct:
- Be respectful and inclusive
- Welcome newcomers and help them get started
- Focus on constructive criticism
- Accept feedback gracefully

## How to Contribute

### Reporting Bugs

1. Check if the bug has already been reported in [Issues](https://github.com/Antonio-MS-Coder/Projection-Mapper/issues)
2. If not, create a new issue with:
   - Clear, descriptive title
   - Steps to reproduce
   - Expected vs actual behavior
   - System information (OS, version, hardware)
   - Screenshots or videos if applicable

### Suggesting Features

1. Check existing [Issues](https://github.com/Antonio-MS-Coder/Projection-Mapper/issues) and [Discussions](https://github.com/Antonio-MS-Coder/Projection-Mapper/discussions)
2. Create a new discussion with:
   - Clear use case description
   - Proposed solution
   - Alternative solutions considered
   - Mockups or examples if applicable

### Code Contributions

#### Setup Development Environment

```bash
# Fork and clone the repository
git clone https://github.com/your-username/Projection-Mapper.git
cd Projection-Mapper

# Install dependencies
npm install

# Create a new branch
git checkout -b feature/your-feature-name

# Run in development mode
npm run dev
```

#### Development Guidelines

1. **Code Style**
   - Use TypeScript for all new code
   - Follow existing code patterns
   - Use meaningful variable and function names
   - Add comments for complex logic

2. **Testing**
   - Test your changes thoroughly
   - Ensure existing features still work
   - Test on multiple platforms if possible

3. **Commits**
   - Use clear, descriptive commit messages
   - Follow conventional commits format:
     - `feat:` New feature
     - `fix:` Bug fix
     - `docs:` Documentation changes
     - `style:` Code style changes
     - `refactor:` Code refactoring
     - `test:` Test additions/changes
     - `chore:` Maintenance tasks

4. **Pull Requests**
   - Update your branch with latest main
   - Provide clear PR description
   - Link related issues
   - Include screenshots/videos for UI changes
   - Ensure all checks pass

#### Project Structure

```
src/
├── main/           # Electron main process
│   ├── main.ts     # Application entry point
│   ├── preload.ts  # Preload script
│   └── websocket.ts # WebSocket server
├── renderer/       # React application
│   ├── components/ # UI components
│   ├── engine/     # WebGL rendering
│   ├── stores/     # State management
│   └── styles/     # Styling
└── shared/         # Shared types/utils
```

### Documentation

- Update README.md if adding features
- Add JSDoc comments to functions
- Update API documentation for WebSocket changes
- Create examples for complex features

## Development Workflow

1. **Plan** - Discuss major changes before implementing
2. **Implement** - Write clean, tested code
3. **Document** - Update relevant documentation
4. **Submit** - Create pull request
5. **Review** - Address feedback
6. **Merge** - Celebrate your contribution!

## Getting Help

- Join our [Discussions](https://github.com/Antonio-MS-Coder/Projection-Mapper/discussions)
- Check the [Wiki](https://github.com/Antonio-MS-Coder/Projection-Mapper/wiki)
- Ask questions in issues
- Contact maintainers

## Recognition

Contributors will be:
- Listed in CONTRIBUTORS.md
- Mentioned in release notes
- Given credit in the application

## License

By contributing, you agree that your contributions will be licensed under the MIT License.

Thank you for helping make Projection Mapper better!