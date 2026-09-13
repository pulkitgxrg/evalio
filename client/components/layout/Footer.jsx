import Link from 'next/link';
import { Target, Brain, LayoutDashboard } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-white text-slate-600 py-16 border-t border-slate-100 flex flex-col justify-center">
      <div className="max-w-[1200px] mx-auto px-6 grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-10 w-full text-left">
          <div className="col-span-2">
              <span className="text-2xl font-black tracking-[-0.04em] text-slate-900 mb-6 block">Evalio.</span>
              <p className="text-slate-500 font-bold mb-8 flex justify-start gap-4 text-lg items-center">
                  <Target size={20}/>
                  <Brain size={20}/>
                  <LayoutDashboard size={20}/>
              </p>
          </div>

          <div className="flex flex-col">
              <h5 className="font-bold text-slate-900 mb-6">Connect With Me</h5>
              <ul className="space-y-4 text-[15px] flex flex-col">
                  {/* <li><Link href="https://x.com/pulkitgarg04" className="hover:text-[#0ddc90] transition-colors" target="_blank">X (Twitter)</Link></li> */}
                  <li><Link href="https://linkedin.com/in/pulkitgxrg" className="hover:text-[#0ddc90] transition-colors" target="_blank">LinkedIn</Link></li>
                  <li><Link href="https://github.com/pulkitgxrg" className="hover:text-[#0ddc90] transition-colors" target="_blank">GitHub</Link></li>
              </ul>
          </div>
          <div className="flex flex-col">
              <h5 className="font-bold text-slate-900 mb-6">Legal</h5>
              <ul className="space-y-4 text-[15px] flex flex-col">
                  <li><Link href="/privacy-policy" className="hover:text-[#0ddc90] transition-colors">Privacy Policy</Link></li>
                  <li><Link href="/terms-conditions" className="hover:text-[#0ddc90] transition-colors">Terms of Service</Link></li>
              </ul>
          </div>
          <div className="flex flex-col">
              <h5 className="font-bold text-slate-900 mb-6">Others</h5>
              <ul className="space-y-4 text-[15px] flex flex-col">
                  <li><Link href="https://testpad.chitkara.edu.in/" className="hover:text-[#0ddc90] transition-colors" target="_blank">Testpad</Link></li>
                  <li><Link href="https://www.letshelp.co.in/" className="hover:text-[#0ddc90] transition-colors">Let&apos;s Help Everyone</Link></li>
              </ul>
          </div>
      </div>

      <div className="max-w-[1200px] mx-auto px-6 mt-20 w-full pt-8 border-t border-slate-100 flex flex-col md:flex-row justify-between items-center text-[13px] font-medium text-slate-400 gap-4">
          <p>© {new Date().getFullYear()} Evalio Data Inc. All rights reserved.</p>
          <div className="flex gap-4 items-center">
              <Link href="https://pulkitgarg.in" className="text-slate-900 font-bold flex items-center gap-1"> Made with ❤️ by Pulkit Garg</Link>
          </div>
      </div>
    </footer>
  );
}
