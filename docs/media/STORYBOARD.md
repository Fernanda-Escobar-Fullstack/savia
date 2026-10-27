# SAVIA demo storyboard

The demo uses SAVIA's real responsive UI with a local, seeded portfolio adapter. It never connects to production Firebase or changes production data. Open Library catalog and book metadata remain real.

| Time | Scene | Verified behavior |
| --- | --- | --- |
| 00:00–00:05 | SAVIA introduction | Project identity and purpose |
| 00:05–00:12 | Mobile catalog | Search, filters, sorting, and Open Library results |
| 00:12–00:19 | Book details | Cover, metadata, subjects, and availability |
| 00:19–00:26 | Borrow confirmation | Explicit confirmation before creating a loan |
| 00:26–00:33 | Reading status | New loan starts as To Read with a 21-day due date |
| 00:33–00:40 | My Library | Active loan, due date, and current progress |
| 00:40–00:47 | Completion | Completed status unlocks the valid return flow |
| 00:47–00:54 | Return confirmation | Explicit confirmation before returning a book |
| 00:54–01:01 | Loan history | Returned loan retained with dates |
| 01:01–01:08 | Reservation | Unavailable book reserved successfully |
| 01:08–01:13 | Closing | Technology summary and live-demo URL |

The adapter exists only under `docs/demo/` and is activated through its dedicated Vite configuration. Production source behavior is unchanged.
