import logo from '../../assets/LogoApp.png'

interface LogoProps {
  size?: number
}

function Logo({ size = 96 }: LogoProps) {
  return (
    <img
      src={logo}
      alt="SAVIA University Library"
      width={size}
      height="auto"
    />
  )
}

export default Logo