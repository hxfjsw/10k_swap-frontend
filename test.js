function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

let a = 0;

async function case1() {
  for (let i = 0; i < 10; i++) {
    let j = a;
    await sleep(10);
    a = j + 1;
    console.log("case1 " + i);
  }
}

async function case2() {
  for (let i = 0; i < 10; i++) {
    let j = a;
    await sleep(10);
    a = j + 1;
    console.log("case2 " + i);
  }


}

async function event_center_popup() {
   await case1();
   await case2();

  await sleep(1000);
  console.log(a);
};



async function block(){
    await sleep(  1000);
    console.log("block")
    console.log(a);

}


setInterval(async function(){
  let j = a;
  await sleep(10);
  a = j + 1;
},100)


setInterval(async function(){
  let j = a;
  await sleep(10);
  a = j + 1;
},100)

block()
