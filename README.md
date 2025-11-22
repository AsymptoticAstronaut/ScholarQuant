UPDATES:
Nov 19:
- can now add scholarships
- ability to store json format for profiles/scholarships: https://claude-kappa-ten.vercel.app/json-demo
- please see /lib/stores/scholarships-store.ts and /lib/stores/student-profiles-store.ts you can change the interfaces as u wish, (it will break the UI for scholarship/profiles but I will fix it once we finalize the protocol)
- you can see how to get the json string from /app/json-demo/page.tsx, i left u an example
- added data like scholarships can now persist and data are managed by Zustand, stored locally


Todo Priority List:
1) Create UI concept DONE
2) Decide what each page looks like/what ideas we include and exclude (must finalize this today) DONE
3) Design how to integrate Claude In progress
4) integrate Claude in progress
5) create slide deck

Schedule:
- Yasser's Availability: Wednesday, Thursday, and Friday all evenings (6pm+), Saturday all day.
- Frank's Availability: 

- Due saturday, presenting sunday

Criteria: https://docs.google.com/document/d/10MTWMA11nTSyE13TyuPFa0Ue0-CDIzSkgJFHekWhNfg/edit?tab=t.b6b6c5gvinhe#heading=h.23q0e57ydvo0

Description:
- Scholarship essay generating app
  Below is the user flow in chronological order
- User opens dashboard, sees reccomended action/overview of analytics
- User opens scholarships, user can add scholarships/import
- User opens student profiles, selects the right one, gets analytics on which scholarships is best match
- Pattern lab  analyzes all the technical stuff, like making stats on which scholarship is most relevant (uses heatmap, ngrams, correlation map)
- FInally, user can draft essay in Draft Studio, there are draft controls etc
- Done, user can also change privacy controls in settings

Instructions:
- Download node https://nodejs.org/en
- Download our github repo zip, extract
- run cmd, cd to project, then type: install node
- then: npm run dev
- open  http://localhost:3000
- changes in ur editor reflect almost immidiately locally, im using vscode 
- if there are no errors, push to github and vercel will update our site automatically
