import fitz,re,json,sys
pdf,out=sys.argv[1:3]; d=fitz.open(pdf)
ans={}
for pi in range(98,101):
 lines=[x.strip() for x in d[pi].get_text().splitlines() if x.strip()]
 for i,x in enumerate(lines[:-1]):
  if re.fullmatch(r'[1-5]\d{3}',x) and re.fullmatch(r'[abc]',lines[i+1],re.I): ans[x]=lines[i+1].lower()
ranges={1:range(17,26),2:range(32,36),3:range(42,46),4:range(65,70),5:range(91,98)}
found={}; anomalies=[]
clean=lambda x:re.sub(r'\s+',' ',x.replace('\xad','')).strip()
for task,pages in ranges.items():
 valid=set(k for k in ans if k.startswith(str(task)))
 for pi in pages:
  text=d[pi].get_text()
  hits=[]
  for m in re.finditer(r'(?m)^[ 	]*([1-5]\d{3})[ \t]*',text):
   if m.group(1) in valid: hits.append((m.start(),m.end(),m.group(1)))
  for j,(s,e,qid) in enumerate(hits):
   end=hits[j+1][0] if j+1<len(hits) else len(text)
   block=text[e:end]
   om=list(re.finditer(r'(?m)^\s*([abc])\.\s*',block))
   if len(om) not in (2,3): continue # filters page-number/header collision such as 2026
   q=clean(block[:om[0].start()]); opts={}
   for k,m in enumerate(om):
    oe=om[k+1].start() if k+1<len(om) else len(block)
    opts[m.group(1)]=clean(block[m.end():oe])
   # Strip footer/header debris from final option conservatively
   for k,v in list(opts.items()):
    v=re.split(r'\s+(?:Manual de preparación de la prueba CCSE|Instituto Cervantes)\b',v)[0].strip()
    opts[k]=v
   if qid in found: anomalies.append(f'duplicate parsed {qid} p{pi+1}')
   else: found[qid]={'id':int(qid),'task':task,'question':q,'options':opts,'answer':ans[qid],'page':pi+1}
for qid,q in found.items():
 if q['answer'] not in q['options']: anomalies.append(f'{qid}: answer missing option')
missing=sorted(set(ans)-set(found))
if missing: anomalies.append('missing: '+','.join(missing))
qs=sorted(found.values(),key=lambda x:x['id'])
counts={str(t):sum(q['task']==t for q in qs) for t in range(1,6)}
obj={'source':'Manual de preparación de la prueba CCSE 2026, Instituto Cervantes','count':len(qs),'task_counts':counts,'questions':qs}
json.dump(obj,open(out,'w'),ensure_ascii=False,indent=2)
print(json.dumps({'answers':len(ans),'questions':len(qs),'counts':counts,'anomalies':anomalies},ensure_ascii=False,indent=2))
