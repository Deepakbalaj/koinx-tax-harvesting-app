# KoinX Tax Loss Harvesting Assignment

A responsive React application for the KoinX frontend internship assignment. The app mocks the required holdings and capital gains APIs, renders pre-harvesting and after-harvesting cards, and updates gains in real time when holdings are selected.

## Tech Stack

- React
- Vite
- Plain CSS
- Mock APIs implemented with delayed promises

## Setup

1. Install dependencies:
   `npm install`
2. Start the dev server:
   `npm run dev`
3. Build for production:
   `npm run build`
4. Preview the production build:
   `npm run preview`

## Features

- Responsive React UI matching the assignment structure
- Mocked `Capital Gains API` and `Holdings API`
- Pre-harvesting and after-harvesting cards
- Row selection and select-all behavior
- Live update of profits, losses, net capital gains, and realised capital gains
- Savings message shown only when realised gains reduce
- Loader and error states
- View all / show less toggle for the holdings table

## Assumptions

- Losses from the API are stored as positive values in the `losses` fields.
- Selecting a holding means the full holding amount is sold, so `Amount to Sell` equals `totalHoldings`.
- Savings is represented as the drop in realised capital gains because tax rate details were not provided in the brief for a direct tax formula.

## Folder Structure

- `src/api` - mocked API functions
- `src/components` - reusable React components
- `src/data` - mock API payloads
- `src/utils` - harvesting calculation helpers

## Screenshots

- Add local screenshots here after running the app in your browser if you want to include them in a submission repo.
