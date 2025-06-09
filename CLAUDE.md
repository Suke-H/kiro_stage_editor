# CLAUDE.md

必ず日本語で回答してください。
Pythonの実行・ライブラリ追加等はすべてpoetryコマンドを使用してください。
This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview
This is a web-based stage editor for the puzzle game "Kiro" (帰路), which allows creating and editing game stages without Unity dependency. The project consists of a React/TypeScript frontend with Redux state management and a Python FastAPI backend for puzzle logic.

## Development Commands

### Frontend (React/TypeScript/Vite)
```bash
cd frontend
npm run dev        # Start development server
npm run build      # Build for production (includes TypeScript compilation)
npm run lint       # Run ESLint
npm run preview    # Preview production build
```

### Backend (Python/FastAPI)
```bash
cd backend
poetry install            # Install dependencies  
poetry run uvicorn main:app --reload  # Start development server
poetry run pytest        # Run all tests
poetry run pytest tests/test_find_path.py  # Run specific test file
```

### Full Stack Development
```bash
./start.sh  # Start both frontend and backend (production setup with nginx)
```

## Architecture

### Frontend State Management (Redux)
The application uses Redux Toolkit with the following main slices:
- `grid-slice`: Game grid state and cell management
- `panel-list-slice`: Panel creation and management
- `panel-placement-slice`: Panel positioning logic
- `studio-mode-slice`: Application mode switching (Editor/Play/Solver)
- `solution-slice`: Puzzle solution tracking

All slices are located in `frontend/src/store/slices/` and configured in `frontend/src/store/index.ts`.

### Backend API Structure
FastAPI application with modular router structure:
- `routers/health.py`: Health check endpoint
- `routers/judge.py`: Game logic validation
- `routers/solver.py`: Puzzle solving algorithms
- `logic/`: Core puzzle algorithms (pathfinding, panel placement)
- `models/`: Pydantic data models (auto-generated from JSON schemas)

### Data Models & Schema Synchronization
Both frontend and backend share identical data structures through JSON schemas located in `frontend/src/schemas/`. Python models in `backend/models/` are auto-generated from these schemas using datamodel-code-generator.

### Game Modes
The application supports three modes:
1. **Editor Mode**: Create/edit grids and panels, export/import YAML
2. **Play Mode**: Interactive puzzle solving with undo/reset
3. **Solver Mode**: Automated puzzle solving (planned feature)

### Core Game Concepts
- **Grid**: 2D game board with cells of different types (Start, Goal, DummyGoal, Crow, Wolf, etc.)
- **Panels**: Moveable pieces placed on the grid
- **Phases**: Game state progression system for tracking moves
- **Path Finding**: Algorithm for validating puzzle solutions considering game rules

### Testing
Backend tests are located in `backend/tests/` with comprehensive path-finding test cases. Test results are logged to `backend/path_logs/` with timestamps for debugging complex scenarios.

### Deployment
The project is containerized with Docker and deployed on Google Cloud Run. Configuration includes nginx reverse proxy setup in `nginx/default.conf`.