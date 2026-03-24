function Login() {
  return (
    <div className="h-full w-full justify-center items-center">
        <form action="post" className="w-100 h-200 flex flex-col gap-3 justify-center items-center">
          <label className="text-start" htmlFor="email">Email</label>
          <input className='border rounded' type="text" name="email" id="email" />
          <label className="text-start" htmlFor="password">Password</label>
          <input className='border rounded' type="text" name="password" id="password" />
        </form>
    </div>
  );
}


export default Login;