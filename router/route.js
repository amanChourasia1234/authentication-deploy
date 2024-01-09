import { Router } from 'express';
import * as controller from '../controllers/appController.js';
import Auth, { localVariables } from '../middleware/auth.js';
import { registerMail } from '../controllers/mailer.js';

const router = Router();

router.route('/register').post(controller.register);
router.route('/registerMail').post(registerMail);
router
  .route('/authenticate')
  .post(controller.verifyUser, (req, res) => res.end());
router.route('/login').post(controller.verifyUser, controller.login);

router.route('/user/:username').get(controller.getUser);
router
  .route('/generateOtp')
  .get(controller.verifyUser, localVariables, controller.generateOtp);
router.route('/verifyOtp').get(controller.verifyUser, controller.verifyOtp);
router.route('/createResetSession').get(controller.createResetSession);

router.route('/updateUser').put(Auth, controller.updateUser);
router
  .route('/resetPassword')
  .put(controller.verifyUser, controller.resetPassword);

export default router;
