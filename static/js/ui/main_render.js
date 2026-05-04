// for this function to work
// the data should have either one property i.e err object or the content
// example data -> {error:err} or {content:'your content'}
export function messageBox(data) {
    const messageEle = document.getElementById('message');
    const messageContent = messageEle.querySelector('#messageContent');
    const messageChildEle = messageEle.children[0];
    if(data.error || data.content){
        if(data.error){
            const err = data.error;
            let [errList] = Object.entries(err)
            let [field, errMsg] = errList
    
            if (field == 'non_field_errors') {
                field = 'Error'
            }
            messageChildEle.classList.add('bg-red-300', 'border-red-500');
            messageChildEle.classList.remove('bg-green-300', 'border-green-500')
            messageContent.innerHTML = `
            <div class='font-bold text-lg'>${field}:</div><div class=' font-light text-lg'>${errMsg}</div>
            `
        }else{
            messageChildEle.classList.add('bg-green-300', 'border-green-500');
            messageChildEle.classList.remove('bg-red-300', 'border-red-500');
            messageContent.innerHTML = `
        <div class='font-bold text-lg'>Success:</div><div class=' font-light text-lg'>${data.content}</div>
                        `
            
        }
    
        messageEle.classList.remove('hidden')
        setTimeout(() => {
            messageEle.classList.add('hidden');
        }, 3000)
    }

}