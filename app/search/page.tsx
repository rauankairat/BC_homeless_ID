export default function Login() {

    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [error, setError] = useState("")
    const router = useRouter()
  
    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault()
      setError("")
  
      const result = await signIn('credentials', {
        email,
        password,
        redirect:false,
      })
  
      if(result?.error){
        setError("Invalid Credentials")
      }else{
        router.push('/')
      }
    }
  
    return (
      <div className={styles.wrapper}>
        <div className={styles.card}>
          <h1 className={styles.title}>Log in</h1>
  
          <form onSubmit={handleSubmit}>
            <label className={styles.label}>Username</label>
            <input className={styles.input} type="text" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email or mobile number" />
  
            <label className={styles.label}>Password</label>
            <input className={styles.input} type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Enter your password" />
  
            {error && <p style={{color: 'red'}}>{error}</p>}
  
            <Link href="/login" className={styles.links}>Forgot Password?</Link>
  
            <button className={styles.button}>Sign in</button>
          </form>
  
          <div className={styles.label}><Link href="/register">Don't have an account? <br />Sign up now!</Link></div>
        </div>
      </div>
    );
  }
  