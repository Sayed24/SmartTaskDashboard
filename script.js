// ================= Sidebar Navigation =================
const sections = document.querySelectorAll('main section');
document.querySelectorAll('.sidebar ul li a').forEach(link=>{
    link.addEventListener('click', e=>{
        e.preventDefault();
        sections.forEach(s=>s.classList.remove('active-section'));
        document.getElementById(link.dataset.section).classList.add('active-section');
        document.querySelectorAll('.sidebar ul li a').forEach(a=>a.classList.remove('active'));
        link.classList.add('active');
        if(link.dataset.section==='calendar') renderCalendar();
        if(link.dataset.section==='tasks') renderProjectsDropdown();
    });
});

// ================= Dark Mode =================
const toggle=document.querySelector('.theme-toggle');
if(toggle){
    toggle.addEventListener('click',()=>{
        document.body.classList.toggle('dark-mode');
        localStorage.setItem('darkMode', document.body.classList.contains('dark-mode'));
    });
}
if(localStorage.getItem('darkMode')==='true') document.body.classList.add('dark-mode');
const darkModeCheckbox=document.getElementById('darkModeToggle');
if(darkModeCheckbox){
    darkModeCheckbox.checked=document.body.classList.contains('dark-mode');
    darkModeCheckbox.addEventListener('change',()=>{
        document.body.classList.toggle('dark-mode');
        localStorage.setItem('darkMode', document.body.classList.contains('dark-mode'));
    });
}

// ================= Toast =================
function showToast(msg){
    const toast=document.getElementById('toast');
    toast.textContent=msg;
    toast.classList.add('show');
    setTimeout(()=>toast.classList.remove('show'),2000);
}

// ================= Dashboard Charts =================
if(document.getElementById('tasksChart')){
    const tasksCtx=document.getElementById('tasksChart').getContext('2d');
    new Chart(tasksCtx,{type:'doughnut',data:{labels:['Completed','Pending'],datasets:[{data:[7,3],backgroundColor:['#1e90ff','#ddd']}]},options:{responsive:true,plugins:{legend:{position:'bottom'}}}});
    const prodCtx=document.getElementById('productivityChart').getContext('2d');
    new Chart(prodCtx,{type:'line',data:{labels:['Mon','Tue','Wed','Thu','Fri','Sat','Sun'],datasets:[{label:'Tasks Completed',data:[2,3,5,4,6,3,7],fill:false,borderColor:'#1e90ff',tension:0.3}]}});
    const projectCount = JSON.parse(localStorage.getItem('projects')||'[]').length;
    document.getElementById('projectCount').innerText=projectCount;
    const deadlinesList = document.getElementById('deadlinesList'); deadlinesList.innerHTML='';
    const tasksDash=JSON.parse(localStorage.getItem('tasks')||'[]').slice(0,3);
    tasksDash.forEach(t=>{ const li=document.createElement('li'); li.textContent=t.name; deadlinesList.appendChild(li); });
}

// ================= Projects =================
const projectInput=document.getElementById('projectName');
const addProjectBtn=document.getElementById('addProjectBtn');
const projectList=document.getElementById('projectList');
let projects=JSON.parse(localStorage.getItem('projects')||'[]');

function renderProjects(){
    if(!projectList) return;
    projectList.innerHTML='';
    projects.forEach((p,i)=>{
        const li=document.createElement('li'); li.textContent=p; li.setAttribute('draggable','true'); li.dataset.index=i;
        li.addEventListener('dragstart',e=>e.dataTransfer.setData('text/plain',i));
        li.addEventListener('dragover',e=>e.preventDefault());
        li.addEventListener('drop',e=>{
            const fromIndex=e.dataTransfer.getData('text/plain'); const toIndex=li.dataset.index;
            [projects[fromIndex],projects[toIndex]]=[projects[toIndex],projects[fromIndex]];
            localStorage.setItem('projects',JSON.stringify(projects)); renderProjects();
        });
        const del=document.createElement('button'); del.textContent='Delete';
        del.addEventListener('click',()=>{ projects.splice(i,1); localStorage.setItem('projects',JSON.stringify(projects)); renderProjects(); showToast('Project deleted!'); });
        li.appendChild(del); projectList.appendChild(li);
    });
}
addProjectBtn?.addEventListener('click',()=>{
    if(projectInput.value.trim()!==''){ projects.push(projectInput.value.trim()); localStorage.setItem('projects',JSON.stringify(projects)); projectInput.value=''; renderProjects(); showToast('Project added!'); }
});
renderProjects();

// ================= Tasks =================
const taskInput=document.getElementById('taskName');
const taskProject=document.getElementById('taskProject');
const addTaskBtn=document.getElementById('addTaskBtn');
const taskList=document.getElementById('taskList');
let tasks=JSON.parse(localStorage.getItem('tasks')||'[]');

function renderProjectsDropdown(){
    if(taskProject){
        taskProject.innerHTML='<option value="">Select Project</option>';
        projects.forEach(p=>{ const option=document.createElement('option'); option.value=p; option.textContent=p; taskProject.appendChild(option); });
    }
}
function renderTasks(){
    if(taskList){
        taskList.innerHTML='';
        tasks.forEach((t,i)=>{
            const li=document.createElement('li');
            li.textContent=`${t.name} [${t.project}]`; li.setAttribute('draggable','true'); li.dataset.index=i;
            li.addEventListener('dragstart',e=>e.dataTransfer.setData('text/plain',i));
            li.addEventListener('dragover',e=>e.preventDefault());
            li.addEventListener('drop',e=>{
                const fromIndex=e.dataTransfer.getData('text/plain'); const toIndex=li.dataset.index;
                [tasks[fromIndex],tasks[toIndex]]=[tasks[toIndex],tasks[fromIndex]];
                localStorage.setItem('tasks',JSON.stringify(tasks)); renderTasks();
            });
            const del=document.createElement('button'); del.textContent='Delete';
            del.addEventListener('click',()=>{ tasks.splice(i,1); localStorage.setItem('tasks',JSON.stringify(tasks)); renderTasks(); showToast('Task deleted!'); });
            const progress=document.createElement('div'); progress.classList.add('progress'); const percent=t.progress||0;
            progress.innerHTML=`<div class="progress-bar" style="width:${percent}%">${percent}%</div>`;
            li.appendChild(progress); li.appendChild(del); taskList.appendChild(li);
        });
    }
}
addTaskBtn?.addEventListener('click',()=>{
    if(taskInput.value.trim()!=='' && taskProject.value!==''){
        tasks.push({name:taskInput.value.trim(),project:taskProject.value,progress:0});
        localStorage.setItem('tasks',JSON.stringify(tasks)); taskInput.value=''; renderTasks(); showToast('Task added!');
    }
});
renderProjectsDropdown(); renderTasks();

// ================= Calendar =================
const calendarContainer=document.getElementById('calendarContainer');
function renderCalendar(){
    if(!calendarContainer) return;
    calendarContainer.innerHTML=''; const date=new Date();
    const month=date.toLocaleString('default',{month:'long'}); const year=date.getFullYear();
    calendarContainer.innerHTML=`<h2>${month} ${year}</h2>`;
    const daysContainer=document.createElement('div'); daysContainer.classList.add('days');
    tasks.forEach(t=>t.date=t.date||Math.floor(Math.random()*31)+1);
    for(let i=1;i<=31;i++){
        const day=document.createElement('div'); day.classList.add('day'); day.textContent=i;
        tasks.forEach(t=>{ if(t.date===i){ const dot=document.createElement('span'); dot.classList.add('task-dot'); day.appendChild(dot); } });
        daysContainer.appendChild(day);
    }
    calendarContainer.appendChild(daysContainer);
}
