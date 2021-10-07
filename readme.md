# Link Bot X

Link Bot reboot

## Getting Started

You will require the following:
  - a mongo db instance
    - try the free tier on their website, saving the protocol and url.
    - create a user and save the user name and password
  - a discord bot
    - save the token from the 'Bot' tab

Save the gathered information into the file `.config.json` in the same format as the `Config` type in `src/types/Config.ts`

Create a `.env` file and add the following environment variables:
  - OWNER - your discord id
    - obtain by right clicking yourself and choosing the `Copy ID` option

To run, use `npm run dev`.