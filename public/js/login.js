
let submitForm = $('#submitform');
$('#SignIn_btn').click(showSignInForm);
$('#SignUp_btn').click(showSignUpForm);

function showSignInForm(){
    $('#SignIn_btn').toggleClass('btnClick', true); //add class
    $('#SignUp_btn').toggleClass('btnClick', false); //remove class
    $('#signin_content').toggleClass('hide', false); //remove class
    $('#signup_content').toggleClass('hide', true); //add class
    $('#title').text('Sign in');
    submitForm.attr("data-type", "signin");
}


function showSignUpForm(){
    $('#SignUp_btn').toggleClass('btnClick', true); //add class
    $('#SignIn_btn').toggleClass('btnClick', false); //remove class
    $('#signup_content').toggleClass('hide', false); //remove class
    $('#signin_content').toggleClass('hide', true); //add class
    $('#title').text('Sign up');
    submitForm.attr("data-type", "signup");
}

submitForm.submit(getToken);

function getToken(e){
    e.preventDefault();
    console.log(e.target.dataset.type);
    
}

